import Sequelize from "sequelize";

export interface SubmissionAttribute {
  assignment: string;
  email: string;
  url: string;
  check_date?: Date;
  check_status?: string;
  check_content?: string;
}

export interface SubmissionInstance
  extends Sequelize.Instance<SubmissionAttribute>,
    SubmissionAttribute {}

export interface SubmissionModel
  extends Sequelize.Model<SubmissionInstance, SubmissionAttribute> {}
