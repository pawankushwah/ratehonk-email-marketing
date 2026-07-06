// Placeholder for User model
// In a real application, this would define a Mongoose schema, Prisma model, or simple class

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export const dummyUsers: User[] = [
  {
    id: '1',
    email: 'test@ratehonk.com',
    name: 'Ratehonk Admin',
    createdAt: new Date(),
  }
];
