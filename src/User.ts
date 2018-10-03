import * as jwt from 'jsonwebtoken';

const admins = ['boris.fritscher@he-arc.ch'];

export default class User {
  public static fromToken(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SHARED_SECRET, (err, decoded: any ) => {
        if (err) {
          return reject(err);
        }
        const user = new User();
        user.email = decoded.email || 'unknown';
        user.firstname = decoded.firstname || 'unknown';
        user.lastname = decoded.lastname || 'unknown';
        user.isAdmin = admins.indexOf(user.email) > -1;

        resolve(user);
      });
    });
  }

  public id: number;
  public email: string;
  public firstname: string;
  public lastname: string;
  public isAdmin: boolean;
}
