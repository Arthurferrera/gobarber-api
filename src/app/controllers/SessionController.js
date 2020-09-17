import jwt from 'jsonwebtoken';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    // busca pelo e-mail para saber se o usuário existe
    const user = await User.findOne( { where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // validando a senha para ver se está correta
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      // gerando o token que segue o formato com o id do usuário,
      // uma string 'aleatória' e o tempo de expiração
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn
      }),
    })

  }
}

export default new SessionController();
