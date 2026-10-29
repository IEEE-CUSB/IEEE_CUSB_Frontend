import { TeamMember } from '@/shared/types/team.types';
import HendIMG from '@/assets/EMBSboard/Hend Abo Elouon.jpeg';
import MahmoudZohranIMG from '@/assets/EMBSboard/Mahmoud Zahran.jpeg';
import FadyNassweIMG from '@/assets/EMBSboard/Fady Nasser.jpg';
import KhadijaIMG from '@/assets/EMBSboard/Khadija Zakaria.jpeg';
import MhmdsherefIMG from '@/assets/EMBSboard/MhmdSheref.jpg';
import MalakSalemIMG from '@/assets/RASboard/malak moustafaa.jpg';
import ReemYoussefIMG from '@/assets/RASboard/Reem Youssef.jpeg';
import AnasIMG from '@/assets/CSboard/Anas.jpg';
import LinaIMG from '@/assets/CSboard/Lina Mahmoud.jpg';
import MohamedEhabIMG from '@/assets/CSboard/Mohamed Ehab Sabry.jpeg';
import EslamRaafatIMG from '@/assets/PESboard/Eslam Raafat.jpg';
import MohamedMostafaIMG from '@/assets/PESboard/Mohamed Mostafa.jpg';
import SalmaWaleedIMG from '@/assets/PESboard/Salma Mohamad.jpg';
import AbdelrahmanKhaledIMG from '@/assets/RASboard/Abderahman Khaled.jpeg';
// ─── Types ───────────────────────────────────────────────────────────────────

export interface Chapter {
  name: string;
  fullName: string;
  slug: string;
  description: string;
  logo?: string;
  email?: string;
  socialLinks?: { facebook?: string; linkedin?: string; instagram?: string };
  board: TeamMember[];
  borderColor?: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function member(
  name: string,
  role: string,
  image: string,
  bio = '',
  linkedin?: string
): TeamMember {
  return {
    name,
    role,
    bio,
    image,
    socials: {
      linkedin: linkedin || '#',
    },
  };
}

// ─── Chapters & Affinity Groups ─────────────────────────────────────────────

export const CHAPTERS: Chapter[] = [
  {
    name: 'WIE',
    fullName: 'Women in Engineering',
    slug: 'wie',
    logo: '/chapters/WIE.png',
    description:
      'IEEE Women in Engineering (WIE) is one of the largest international professional organizations dedicated to promoting women engineers and scientists, and inspiring girls around the world to follow their academic interests in a career in engineering.',
    board: [],
    borderColor: '#c084fc',
  },
  {
    name: 'EMBS',
    fullName: 'Engineering in Medicine and Biology Society',
    slug: 'embs',
    logo: '/chapters/EMBS.png',
    description:
      "The IEEE Engineering in Medicine and Biology Society (EMBS) is the world's largest international society of biomedical engineers. Our mission is to advance the application of engineering sciences and technology to medicine and biology.",
    email: 'embs@ieeecusb.org',
    borderColor: '#8b8bc7',
    board: [
      member(
        'Hend Aboelouon',
        'Chairwoman',
        HendIMG,
        '',
        'https://www.linkedin.com/in/hend-abo-elouon-968995232'
      ),
      member(
        'Mahmoud Zahran',
        'Vice-Chairman',
        MahmoudZohranIMG,
        '',
        'https://www.linkedin.com/in/mm-zahran'
      ),
      member(
        'Fady Nasser',
        'Secretary',
        FadyNassweIMG,
        '',
        'https://www.linkedin.com/in/fady-nasser-aziz/'
      ),
      member(
        'Mohamed Sheref',
        'Webmaster',
        MhmdsherefIMG,
        '',
        'https://www.linkedin.com/in/mohamed-sheref-elezaly/'
      ),
      member(
        'Khadija Zakaria',
        'Treasurer',
        KhadijaIMG,
        '',
        'https://www.linkedin.com/in/khadijazakaria'
      ),
    ],
  },
  {
    name: 'RAS',
    fullName: 'Robotics and Automation Society',
    slug: 'ras',
    logo: '/chapters/RAS.png',
    description:
      'The IEEE Robotics and Automation Society (RAS) bridge the gap between theoretical knowledge and practical engineering through technical workshops, hands-on learning, robotics competitions, and collaborative projects.Our mission is to empower university students to develop technical expertise, explore emerging technologies, and transform innovative ideas into meaningful engineering solutions.',
    borderColor: '#c47799',
    board: [
      member(
        'Reem Youssef',
        'Chairwoman',
        ReemYoussefIMG,
        '',
        'https://www.linkedin.com/in/reem-youssef-3520392a4'
      ),
      member(
        'Malak Salem',
        'Vice-Chairwomen',
        MalakSalemIMG,
        '',
        'https://www.linkedin.com/in/malak-salem-152849302 '
      ),
      member(
        'Abdelrahman Khaled',
        'Secretary',
        AbdelrahmanKhaledIMG,
        '',
        'https://www.linkedin.com/in/abdelrahman-khaled-0baa36379/'
      ),
    ],
  },
  {
    name: 'CS',
    fullName: 'Computer Society',
    slug: 'cs',
    logo: '/chapters/CS.png',
    description:
      'The IEEE Computer Society (CS) is the world’s leading membership organization dedicated to computer science and technology. Our mission is to advance the theory, practice, and application of computer and information processing technology.',

    borderColor:  '#c6a85a',
    board: [
      member(
        'Anas Ahmed',
        'Chairman',
        AnasIMG,
        '',
        'https://www.linkedin.com/in/anas-salhen-06ba9733a'
      ),
      member(
        'Lina Mahmoud',
        'Vice-Chairwoman',
        LinaIMG,
        '',
        'https://www.linkedin.com/in/lina-mahmoud-767139296/'
      ),
      member(
        'Mohamed Ehab',
        'Secretary',
        MohamedEhabIMG,
        '',
        'https://www.linkedin.com/in/mohamed-ehab-sabry'
      ),
    ],
  },
  {
    name: 'PES',
    fullName: 'Power & Energy Society',
    slug: 'pes',
    logo: '/chapters/PES.png',

    description:
      'The IEEE Power & Energy Society (PES) is a leading professional organization dedicated to the advancement of power and energy technologies. Our mission is to promote the development and application of innovative solutions in the field of power and energy systems.',
    borderColor:  '#83b36f',
    board: [
      member(
        'Eslam Raafat',
        'Chairman',
        EslamRaafatIMG,
        '',
        'https://www.linkedin.com/in/es-raafat'
      ),
      member(
        'Mohamed Mostafa',
        'Vice-Chairman',
        MohamedMostafaIMG,
        '',
        'https://www.linkedin.com/in/mohamed-mostafa44/'
      ),
      member(
        'Salma Waleed',
        'Secretary',
        SalmaWaleedIMG,
        '',
        'https://www.linkedin.com/in/salma-waleed-anwar/'
      ),
    ],
  },
];
