import { Model, BuildOptions } from "sequelize";

export interface SubmissionModel extends Model {
  assignment: string;
  email: string;
  url: string;
  check_date?: Date;
  check_status?: string;
  check_content?: string;
}

type SubmissionModelStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): SubmissionModel
}
