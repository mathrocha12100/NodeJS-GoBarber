import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const userIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });
    if (!userIsProvider) {
      return res.status(401).json({ error: 'User is not a provider' });
    }
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);
    return res.json(notifications);
  }

  async update(req, res) {
    const { id } = req.params;
    try {
      const notification = await Notification.findByIdAndUpdate(
        id,
        {
          read: true,
        },
        { new: true }
      );
      return res.json(notification);
    } catch (error) {
      return res.status(400).json({ error: 'notification not found' });
    }
  }
}

export default new NotificationController();
