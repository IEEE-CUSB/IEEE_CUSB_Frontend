const DepartmentList = [
  'Aeronautical and Aerospace Engineering',
  'Architectural Engineering',
  'Systems and Biomedical Engineering',
  'Chemical Engineering',
  'Computer Engineering',
  'Electrical Power Engineering',
  'Electronic and Electrical Communications Engineering',
  'Civil Engineering',
  'Mechanical Design and Production',
  'Mechanical Power Engineering',
  'Mining & Geological Engineering Program',
  'Petroleum Engineering Program',
  'Metallurgical Engineering Program',
  'Communication and Computer Engineering (CCE)',
  'Construction Engineering and Management (CEM)',
  'Structural Engineering (STE)',
  'Architectural Engineering and Technology (AET)',
  'Petroleum and Petrochemical Engineering (PPC)',
  'Mechanical Design Engineering (MDE)',
  'Electrical Energy Engineering (EEE)',
  'Civil Infrastructure Engineering (CIE)',
  'Aeronautical Engineering & aviation Management (AEM)',
  'Mechatronics Engineering (MEE)',
  'Biomedical Data Engineering (BDE)',
  'Industrial Engineering & Management (IEM)',
  'Manufacturing Engineering & Materials (MEM)',
  'Sustainable Energy Engineering (SEE)',
  'Water Engineering and Environment (WEE)',
  'Preparatory year',
];
export const CSDepartmentList = [
  'Data Science',
  'Cybersecurity',
  'Software Engineering',
  'Information Technology',
  'Artificial Intelligence',
  'Decision Support',
  'Computer Science',
  'Information Systems',
];

export const getDepartmentsForFaculty = (faculty?: string): string[] => {
  if (!faculty) return DepartmentList;
  const normalized = faculty.trim().toLowerCase();
  if (
    normalized.includes('computer') ||
    normalized.includes('artificial intelligence') ||
    normalized.includes('information technology')
  ) {
    return CSDepartmentList;
  }
  return DepartmentList;
};

export default DepartmentList;
