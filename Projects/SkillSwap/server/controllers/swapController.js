import SkillSwapRequest from '../models/SkillSwapRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { v4 as uuidv4 } from 'uuid';

export const createSwapRequest = async (req, res) => {
  try {
    const { recipientId, message, proposedDateTime, initiatorOffersSkill, initiatorWantsSkill } = req.body;
    
    const initiator = await User.findById(req.userId);
    if (!initiator) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (initiator.skillCredits < 10) {
      return res.status(400).json({ message: 'Insufficient skill credits to create swap request' });
    }
    
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Get recipient's corresponding skills
    const recipientOffersSkill = recipient.skillsOffered.find(
      s => s.name.toLowerCase() === initiatorWantsSkill.name.toLowerCase()
    );
    const recipientWantsSkill = recipient.skillsWanted.find(
      s => s.name.toLowerCase() === initiatorOffersSkill.name.toLowerCase()
    );
    
    const swapRequest = new SkillSwapRequest({
      initiatorId: req.userId,
      recipientId,
      initiatorOffersSkill,
      initiatorWantsSkill,
      recipientOffersSkill: recipientOffersSkill || { name: initiatorWantsSkill.name },
      recipientWantsSkill: recipientWantsSkill || { name: initiatorOffersSkill.name },
      message,
      proposedDateTime: proposedDateTime ? new Date(proposedDateTime) : null,
    });
    
    await swapRequest.save();
    
    // Deduct credits
    initiator.skillCredits -= 10;
    await initiator.save();
    
    // Create notification
    await Notification.create({
      userId: recipientId,
      type: 'swap_request',
      title: `New swap request from ${initiator.name}`,
      message: `${initiator.name} wants to swap their ${initiatorOffersSkill.name} skill for your ${initiatorWantsSkill.name} skill`,
      relatedSwapRequestId: swapRequest._id,
    });
    
    res.status(201).json({ message: 'Swap request created', swapRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const respondToSwapRequest = async (req, res) => {
  try {
    const { swapRequestId, response, proposedDateTime } = req.body;
    const swapRequest = await SkillSwapRequest.findById(swapRequestId);
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    if (swapRequest.recipientId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to respond to this request' });
    }
    
    if (response === 'accepted') {
      swapRequest.status = 'accepted';
      swapRequest.proposedDateTime = proposedDateTime ? new Date(proposedDateTime) : swapRequest.proposedDateTime;
      
      const initiator = await User.findById(swapRequest.initiatorId);
      
      // Create notification for initiator
      await Notification.create({
        userId: swapRequest.initiatorId,
        type: 'swap_accepted',
        title: 'Swap request accepted!',
        message: `${(await User.findById(req.userId)).name} accepted your swap request`,
        relatedSwapRequestId: swapRequest._id,
      });
    } else if (response === 'rejected') {
      swapRequest.status = 'rejected';
      
      // Refund credits to initiator (half back)
      const initiator = await User.findById(swapRequest.initiatorId);
      initiator.skillCredits += 5;
      await initiator.save();
      
      // Create notification
      await Notification.create({
        userId: swapRequest.initiatorId,
        type: 'swap_rejected',
        title: 'Swap request rejected',
        message: 'Your swap request was rejected',
        relatedSwapRequestId: swapRequest._id,
      });
    }
    
    await swapRequest.save();
    res.json({ message: `Swap request ${response}`, swapRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSwapRequests = async (req, res) => {
  try {
    const { status, type } = req.query; // type: 'sent' or 'received'
    let query = {};
    
    if (type === 'sent') {
      query.initiatorId = req.userId;
    } else if (type === 'received') {
      query.recipientId = req.userId;
    } else {
      query.$or = [{ initiatorId: req.userId }, { recipientId: req.userId }];
    }
    
    if (status) {
      query.status = status;
    }
    
    const swapRequests = await SkillSwapRequest.find(query)
      .populate('initiatorId', '-password')
      .populate('recipientId', '-password')
      .sort({ createdAt: -1 });
    
    res.json(swapRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPotentialMatches = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find users who offer what we want
    const matches = [];
    for (const wantedSkill of user.skillsWanted) {
      const potentialMatches = await User.find({
        _id: { $ne: req.userId },
        'skillsOffered.name': { $regex: wantedSkill.name, $options: 'i' },
      }).select('-password');
      
      for (const match of potentialMatches) {
        // Check if they also want something we offer
        const offeredByUs = user.skillsOffered.find(
          s => s.name.toLowerCase() === wantedSkill.name.toLowerCase()
        );
        
        const wantedByThem = match.skillsWanted.some(
          s => s.name.toLowerCase() === wantedSkill.name.toLowerCase()
        );
        
        if (offeredByUs && wantedByThem) {
          matches.push({
            user: match,
            matchedSkill: wantedSkill.name,
          });
        }
      }
    }
    
    // Remove duplicates
    const uniqueMatches = Array.from(
      new Map(matches.map(m => [m.user._id.toString(), m])).values()
    );
    
    res.json(uniqueMatches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeSwap = async (req, res) => {
  try {
    const { swapRequestId } = req.body;
    const swapRequest = await SkillSwapRequest.findById(swapRequestId);
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted requests can be completed' });
    }
    
    swapRequest.status = 'completed';
    await swapRequest.save();
    
    // Increment completed swaps for both users
    const initiator = await User.findById(swapRequest.initiatorId);
    const recipient = await User.findById(swapRequest.recipientId);
    
    initiator.completedSwaps += 1;
    recipient.completedSwaps += 1;
    
    // Award skill credits
    initiator.skillCredits += 5;
    recipient.skillCredits += 5;
    
    await initiator.save();
    await recipient.save();
    
    res.json({ message: 'Swap marked as completed', swapRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateMeetingLink = async (req, res) => {
  try {
    const { swapRequestId } = req.body;
    const swapRequest = await SkillSwapRequest.findById(swapRequestId);
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({ message: 'Meeting link can only be generated for accepted requests' });
    }
    
    // Generate unique meeting room ID
    const roomId = uuidv4().substring(0, 8);
    const meetingLink = `${process.env.JITSI_DOMAIN || 'https://meet.jitsi.is'}/${roomId}`;
    
    swapRequest.meetingLink = meetingLink;
    swapRequest.meetingLinkExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await swapRequest.save();
    
    res.json({ meetingLink, swapRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
