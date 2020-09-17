import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    // validação do corpo da requisição, o tipo dos dados, tamanho...
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // busca pelo e-mail para saber se o usuário já existe
    const userExists = await User.findOne( { where: { email: req.body.email } } );

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' })
    }

    // criando o usuário
    const { id, name, email, provider } = await User.create(req.body);
    return res.json({id, name, email, provider});
  }

  async update(req, res) {
    // validação do corpo da requisição, o tipo dos dados, tamanho...
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string().min(6).when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required() : field
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      )
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, oldPassword } = req.body;

    // busca pelo id para saber se o usuário já existe
    const user = await User.findByPk(req.userId);

    // validando se há mudança no e-mail, para validar se o e-mail novo já existe
    if (email !== user.email) {
      const userExists = await User.findOne( { where: { email } } );

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' })
      }
    }

    // validando se há alteração na senha, e verificando se a senha antiga está correta
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' })
    }

    // atualizando os dados
    const { id, name, provider } = await user.update(req.body);

    return res.json({id, name, email, provider});
  }
}

export default new UserController();
