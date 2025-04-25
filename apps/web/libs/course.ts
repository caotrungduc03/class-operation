export enum CourseType {
  TOEIC = "TOEIC",
  TOEFL = "TOEFL",
  IELTS = "IELTS",
}

export interface ICourse {
  id: string;
  code: string;
  name: string;
  description: string;
  status: boolean;
  type: CourseType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  code?: string;
  name?: string;
  description?: string;
  status?: boolean;
  type?: CourseType;
}
