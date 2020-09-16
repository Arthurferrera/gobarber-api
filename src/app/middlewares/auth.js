import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  // o split retorna um array, com a desestruturação colocando apenas a ','
  // na primeira posição, ele descarta o primeiro valor, pois não será usado
  const [, token] = authHeader.split(' ');

  try {
    // Decodificando o token do usuário para pegar o ID respectivo a ele
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
