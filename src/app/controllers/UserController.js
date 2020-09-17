import User from '../models/User';

class UserController {
  async store(req, res) {
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
