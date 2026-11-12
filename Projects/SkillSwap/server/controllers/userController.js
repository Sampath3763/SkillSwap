import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, location, bio, availability, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, location, bio, availability, profileImage },
      { new: true, runValidators: true }
    );
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addSkill = async (req, res) => {
  try {
    const { skillType, skill } = req.body; // skillType: 'offered' or 'wanted'
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (skillType === 'offered') {
      user.skillsOffered.push(skill);
    } else if (skillType === 'wanted') {
      user.skillsWanted.push(skill);
    } else {
      return res.status(400).json({ message: 'Invalid skill type' });
    }
    
    await user.save();
    res.json({ message: 'Skill added', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeSkill = async (req, res) => {
  try {
    const { skillType, skillIndex } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (skillType === 'offered') {
      user.skillsOffered.splice(skillIndex, 1);
    } else if (skillType === 'wanted') {
      user.skillsWanted.splice(skillIndex, 1);
    }
    
    await user.save();
    res.json({ message: 'Skill removed', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { skillName, location, level } = req.query;
    let query = {};
    
    if (skillName) {
      query.$or = [
        { 'skillsOffered.name': { $regex: skillName, $options: 'i' } },
        { 'skillsWanted.name': { $regex: skillName, $options: 'i' } },
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (level) {
      query.$or = [
        { 'skillsOffered.level': level },
        { 'skillsWanted.level': level },
      ];
    }
    
    // Never return the current user in search results
    if (req.userId) {
      query._id = { $ne: req.userId };
    }

    const users = await User.find(query).select('-password').limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
