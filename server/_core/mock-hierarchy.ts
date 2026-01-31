// Mock hierarchy data for development
export const mockFaculties = [
  { id: 1, name: "Faculty of Pharmacy", code: "PHARM", createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: "Faculty of Science", code: "SCI", createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: "Faculty of Engineering", code: "ENG", createdAt: new Date(), updatedAt: new Date() },
];

export const mockDepartments = [
  { id: 1, name: "Pharmaceutical Chemistry", code: "PHCHEM", facultyId: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: "Pharmacology", code: "PHARM", facultyId: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: "Pharmacy Practice", code: "PHPRAC", facultyId: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: "Chemistry", code: "CHEM", facultyId: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: "Biology", code: "BIO", facultyId: 2, createdAt: new Date(), updatedAt: new Date() },
];

export const mockLaboratories = [
  { id: 1, name: "Lab Ph 101", code: "LAB101", departmentId: 1, location: "Building A", createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: "Lab Ph 102", code: "LAB102", departmentId: 1, location: "Building A", createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: "Lab Ph 103", code: "LAB103", departmentId: 1, location: "Building B", createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: "Lab Chem 201", code: "LAB201", departmentId: 4, location: "Building C", createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: "Lab Bio 301", code: "LAB301", departmentId: 5, location: "Building D", createdAt: new Date(), updatedAt: new Date() },
];
