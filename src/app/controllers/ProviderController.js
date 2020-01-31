import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const providers = await User.findAll({
      where: { provider: true },
      attributes: ['name', 'email', 'id', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });
    if (!providers) {
      return res.status(400).json({ error: 'Dont exists any providers' });
    }
    return res.json(providers);
  }
}

export default new ProviderController();
