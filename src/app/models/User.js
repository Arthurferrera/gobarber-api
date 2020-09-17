import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    // definindo a model de usuário, os campos que podem ser manipulados via código
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      { sequelize }
    );

    // validação feita antes de salvar no banco
    // criando a hash da senha
    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user .password, 8);
      }
    });

    return this;
  }

  // função que compara as senhas e retorna se são iguais ou não
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
