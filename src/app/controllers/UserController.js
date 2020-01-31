import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async index(req, res) {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(400).json({ error: 'User does not exist' });
    }
    return res.json(user);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      password: Yup.string()
        .required()
        .min(6),
      email: Yup.string()
        .email()
        .required(),
      provider: Yup.bool(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Creation fails' });
    }
    const { email } = req.body;
    const userExists = await User.findOne({
      where: { email },
    });
    if (userExists) {
      return res.status(401).json({ error: 'User already exists!' });
    }
    const user = await User.create(req.body);
    const { name, provider, password_hash } = user;

    return res.json({
      email,
      name,
      provider,
      password_hash,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string()
        .min(6)
        .required(),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required() : field
      ),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);
    if (email !== user.email) {
      const userExists = User.findOne({
        where: { email },
      });
      if (userExists) {
        return res.status(400).json({ error: 'User already exists!' });
      }
    }
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }
    const { password, name, provider } = await user.update(req.body);
    return res.json({
      password,
      name,
      provider,
    });
  }
}

export default new UserController();
