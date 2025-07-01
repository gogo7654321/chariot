
export type Flashcard = {
  term: string;
  definition: string;
};

export type Question = {
  question: string;
  options: string[];
  answer: string;
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  flashcards: Flashcard[];
  questions: Question[];
};

export type Course = {
  id: string; // e.g. ap_us_history
  slug: string; // e.g. ap-us-history
  name: string; // e.g. AP US History
  icon: string; // component name, emoji, or URL path
  description: string;
  subject: string;
  examDate: string;
  units: Unit[];
  comingSoon?: boolean;
};

export const courses: Course[] = [
    {
      id: 'ap_art_history',
      slug: 'ap-art-history',
      name: 'AP Art History',
      description: 'Explore the history of art through critical analysis of architecture, sculpture, painting, and other artistic media.',
      icon: '/images/ap_art_history.svg',
      subject: 'Arts',
      examDate: "2026-05-14T08:00:00",
      units: []
    },
    {
      id: 'ap_biology',
      slug: 'ap-biology',
      name: 'AP Biology',
      description: 'Explore the science of life through laboratory investigations and advanced study of cellular processes, genetics, evolution, and ecology.',
      icon: '/images/ap_biology.svg',
      subject: 'Science',
      examDate: "2026-05-04T08:00:00",
      units: [
        {
          id: "unit-1",
          title: "Unit 1: Chemistry of Life",
          description: "Understand the chemical and physical properties of water and the structures of macromolecules.",
          flashcards: [
            { term: "Macromolecule", definition: "A very large molecule, such as protein, commonly created by polymerization of smaller subunits." },
            { term: "Hydrolysis", definition: "The chemical breakdown of a compound due to reaction with water." },
          ],
          questions: [
            { question: "Which of the following is NOT one of the four main types of macromolecules?", options: ["Carbohydrates", "Lipids", "Nucleic Acids", "Calcium"], answer: "Calcium" },
          ]
        }
      ]
    },
    {
      id: 'ap_calculus_ab',
      slug: 'ap-calculus-ab',
      name: 'AP Calculus AB',
      description: 'Master the fundamentals of differential and integral calculus through limits, derivatives, and their applications.',
      icon: '/images/ap_calculus_ab.svg',
      subject: 'Mathematics',
      examDate: "2026-05-11T08:00:00",
      units: []
    },
    {
      id: 'ap_calculus_bc',
      slug: 'ap-calculus-bc',
      name: 'AP Calculus BC',
      description: 'Advanced calculus covering all AB topics plus additional techniques of integration, series, and parametric equations.',
      icon: '/images/ap_calculus_bc.svg',
      subject: 'Mathematics',
      examDate: "2026-05-11T08:00:00",
      units: []
    },
    {
      id: 'ap_capstone_research',
      slug: 'ap-capstone-research',
      name: 'AP Capstone Research',
      description: 'Conduct independent research on a topic of personal interest, culminating in an academic paper and presentation.',
      icon: '/images/ap_research.png',
      subject: 'Interdisciplinary',
      examDate: "2026-04-30T23:59:00",
      units: []
    },
    {
      id: 'ap_capstone_seminar',
      slug: 'ap-capstone-seminar',
      name: 'AP Capstone Seminar',
      description: 'Develop critical thinking and research skills through investigation of complex, real-world issues and problems.',
      icon: '/images/ap_seminar.svg',
      subject: 'Interdisciplinary',
      examDate: "2026-05-11T12:00:00",
      units: []
    },
    {
      id: 'ap_chemistry',
      slug: 'ap-chemistry',
      name: 'AP Chemistry',
      description: 'Dive deep into chemical reactions, atomic structure, bonding, and thermodynamics through hands-on laboratory work.',
      icon: '/images/ap_chemistry.svg',
      subject: 'Science',
      examDate: "2026-05-05T08:00:00",
      units: [
        {
          id: "unit-1",
          title: "Unit 1: Atomic Structure and Properties",
          description: "Explore moles, mass spectrometry, elemental composition, and mixtures.",
          flashcards: [
            { term: "Mole", definition: "The SI unit of amount of substance, equal to the quantity containing as many elementary units as there are atoms in 0.012 kg of carbon-12." },
            { term: "Aufbau Principle", definition: "States that electrons fill lower-energy atomic orbitals before filling higher-energy ones." },
          ],
          questions: [
            { question: "What is the electron configuration of Sodium (Na)?", options: ["1s²2s²2p⁶3s¹", "1s²2s²2p⁵3s²", "1s²2s²2p⁶", "1s²2s²2p⁶3s²"], answer: "1s²2s²2p⁶3s¹" },
          ]
        },
        {
          id: "unit-2",
          title: "Unit 2: Molecular and Ionic Compound Structure and Properties",
          description: "Learn about chemical bonds, Lewis diagrams, and molecular geometry.",
          flashcards: [],
          questions: []
        }
      ]
    },
    {
      id: 'ap_chinese_language',
      slug: 'ap-chinese-language',
      name: 'AP Chinese Language and Culture',
      description: 'Develop proficiency in Chinese through authentic materials and cultural exploration of Chinese-speaking regions.',
      icon: '/images/ap_chinese_language_and_culture.svg',
      subject: 'World Languages',
      examDate: "2026-05-08T12:00:00",
      units: []
    },
    {
      id: 'ap_comparative_government',
      slug: 'ap-comparative-government',
      name: 'AP Comparative Government and Politics',
      description: 'Compare political systems, institutions, and processes across different countries and regions.',
      icon: '/images/ap_comparative_government_and_politics.svg',
      subject: 'Social Studies',
      examDate: "2026-05-06T12:00:00",
      units: []
    },
    {
      id: 'ap_computer_science_a',
      slug: 'ap-computer-science-a',
      name: 'AP Computer Science A',
      description: 'Learn object-oriented programming in Java, including data structures, algorithms, and software design principles.',
      icon: '/images/ap_computer_science_a.svg',
      subject: 'Computer Science',
      examDate: "2026-05-15T12:00:00",
      units: []
    },
    {
      id: 'ap_computer_science_principles',
      slug: 'ap-computer-science-principles',
      name: 'AP Computer Science Principles',
      description: 'Explore the foundational concepts of computer science including programming, algorithms, and the impact of computing.',
      icon: '/images/ap_computer_science_principles.svg',
      subject: 'Computer Science',
      examDate: "2026-05-14T12:00:00",
      units: []
    },
    {
      id: 'ap_english_language',
      slug: 'ap-english-language',
      name: 'AP English Language and Composition',
      description: 'Develop advanced writing and analytical skills through the study of rhetoric, argumentation, and composition.',
      icon: '/images/ap_english_language_and_composition.svg',
      subject: 'English',
      examDate: "2026-05-13T08:00:00",
      units: [
         {
          id: "unit-1",
          title: "Unit 1: Rhetorical Analysis",
          description: "Learn to analyze and interpret samples of good writing, identifying and explaining an author's use of rhetorical strategies.",
          flashcards: [
            { term: "Exigence", definition: "The specific occasion/event that prompted the message to be spoken/written" },
            { term: "Logos", definition: "An appeal to logic and reason." },
          ],
          questions: [
            { question: "The 'appeal to emotion' is also known as:", options: ["Logos", "Pathos", "Ethos", "Kairos"], answer: "Pathos" },
          ]
        }
      ]
    },
    {
      id: 'ap_english_literature',
      slug: 'ap-english-literature',
      name: 'AP English Literature and Composition',
      description: 'Analyze and interpret literature while developing sophisticated writing skills and critical thinking abilities.',
      icon: '/images/ap_english_literature_and_composition.svg',
      subject: 'English',
      examDate: "2026-05-06T08:00:00",
      units: []
    },
    {
      id: 'ap_environmental_science',
      slug: 'ap-environmental-science',
      name: 'AP Environmental Science',
      description: 'Study environmental systems, human impact on the environment, and solutions to environmental problems.',
      icon: '/images/ap_environmental_science.svg',
      subject: 'Science',
      examDate: "2026-05-15T08:00:00",
      units: []
    },
    {
      id: 'ap_european_history',
      slug: 'ap-european-history',
      name: 'AP European History',
      description: 'Explore European history from 1450 to present, analyzing historical documents and developing historical thinking skills.',
      icon: '/images/ap_european_history.svg',
      subject: 'Social Studies',
      examDate: "2026-05-04T12:00:00",
      units: []
    },
    {
      id: 'ap_french_language',
      slug: 'ap-french-language',
      name: 'AP French Language and Culture',
      description: 'Develop proficiency in French through authentic materials and cultural exploration of French-speaking countries.',
      icon: '/images/ap_french_language_and_culture.svg',
      subject: 'World Languages',
      examDate: "2026-05-12T08:00:00",
      units: []
    },
    {
      id: 'ap_german_language',
      slug: 'ap-german-language',
      name: 'AP German Language and Culture',
      description: 'Develop proficiency in German through authentic materials and cultural exploration of German-speaking countries.',
      icon: '/images/ap_german_language_and_culture.svg',
      subject: 'World Languages',
      examDate: "2026-05-13T08:00:00",
      units: []
    },
    {
      id: 'ap_human_geography',
      slug: 'ap-human-geography',
      name: 'AP Human Geography',
      description: 'Examine patterns and processes that shape human understanding and use of Earth at local, regional, and global scales.',
      icon: '/images/ap_human_geography.svg',
      subject: 'Social Studies',
      examDate: "2026-05-05T08:00:00",
      units: []
    },
    {
      id: 'ap_italian_language',
      slug: 'ap-italian-language',
      name: 'AP Italian Language and Culture',
      description: 'Develop proficiency in Italian through authentic materials and cultural exploration of Italian-speaking regions.',
      icon: '/images/ap_italian_language_and_culture.svg',
      subject: 'World Languages',
      examDate: "2026-05-08T08:00:00",
      units: []
    },
    {
      id: 'ap_japanese_language',
      slug: 'ap-japanese-language',
      name: 'AP Japanese Language and Culture',
      description: 'Develop proficiency in Japanese through authentic materials and cultural exploration of Japan.',
      icon: '/images/ap_japanese_language_and_culture.svg',
      subject: 'World Languages',
      examDate: "2026-05-12T12:00:00",
      units: []
    },
    {
      id: 'ap_latin',
      slug: 'ap-latin',
      name: 'AP Latin',
      description: 'Study Latin literature, language, and Roman culture through reading and analysis of classical texts.',
      icon: '/images/ap_latin.svg',
      subject: 'World Languages',
      examDate: "2026-05-04T08:00:00",
      units: []
    },
    {
      id: 'ap_macroeconomics',
      slug: 'ap-macroeconomics',
      name: 'AP Macroeconomics',
      description: 'Study economic principles that apply to an economy as a whole, including national income, inflation, and fiscal policy.',
      icon: '/images/ap_macroeconomics.svg',
      subject: 'Social Studies',
      examDate: "2026-05-08T12:00:00",
      units: []
    },
    {
      id: 'ap_microeconomics',
      slug: 'ap-microeconomics',
      name: 'AP Microeconomics',
      description: 'Analyze individual economic behavior, market structures, and the role of government in correcting market failures.',
      icon: '/images/ap_microeconomics.svg',
      subject: 'Social Studies',
      examDate: "2026-05-04T12:00:00",
      units: []
    },
    {
      id: 'ap_music_theory',
      slug: 'ap-music-theory',
      name: 'AP Music Theory',
      description: 'Develop skills in music composition, analysis, and aural perception through study of musical elements and structures.',
      icon: '/images/ap_music_theory.svg',
      subject: 'Arts',
      examDate: "2026-05-11T12:00:00",
      units: []
    },
    {
      id: 'ap_physics_1',
      slug: 'ap-physics-1',
      name: 'AP Physics 1',
      description: 'Explore mechanics, waves, and sound through inquiry-based laboratory investigations and mathematical analysis.',
      icon: '/images/ap_physics_1.svg',
      subject: 'Science',
      examDate: "2026-05-06T12:00:00",
      units: []
    },
    {
      id: 'ap_physics_2',
      slug: 'ap-physics-2',
      name: 'AP Physics 2',
      description: 'Study electricity, magnetism, optics, thermodynamics, and modern physics through hands-on experiments.',
      icon: '/images/ap_physics_2_algebra_based.svg',
      subject: 'Science',
      examDate: "2026-05-07T08:00:00",
      units: []
    },
    {
      id: 'ap_physics_c_mechanics',
      slug: 'ap-physics-c-mechanics',
      name: 'AP Physics C: Mechanics',
      description: 'Advanced calculus-based study of classical mechanics including kinematics, dynamics, and energy conservation.',
      icon: '/images/ap_physics_c_mechanics.svg',
      subject: 'Science',
      examDate: "2026-05-13T12:00:00",
      units: []
    },
    {
      id: 'ap_physics_c_electricity_magnetism',
      slug: 'ap-physics-c-electricity-magnetism',
      name: 'AP Physics C: Electricity & Magnetism',
      description: 'Calculus-based exploration of electric fields, magnetic fields, and electromagnetic induction.',
      icon: '/images/ap_physics_c_electricity_and_magnetism.svg',
      subject: 'Science',
      examDate: "2026-05-14T12:00:00",
      units: []
    },
    {
      id: 'ap_precalculus',
      slug: 'ap-precalculus',
      name: 'AP Precalculus',
      description: 'Build mathematical foundation for calculus through functions, trigonometry, and analytical geometry.',
      icon: '/images/ap_precalculus.svg',
      subject: 'Mathematics',
      examDate: "2026-05-12T08:00:00",
      units: []
    },
    {
      id: 'ap_psychology',
      slug: 'ap-psychology',
      name: 'AP Psychology',
      description: 'Examine human behavior and mental processes through scientific methods and psychological perspectives.',
      icon: '/images/ap_psychology.svg',
      subject: 'Social Studies',
      examDate: "2026-05-12T12:00:00",
      units: []
    },
    {
      id: 'ap_spanish_language',
      slug: 'ap-spanish-language',
      name: 'AP Spanish Language and Culture',
      description: 'Develop proficiency in Spanish through authentic materials and cultural exploration of Spanish-speaking countries.',
      icon: '/images/ap_spanish_language_and_culture.svg',
      subject: 'World Languages',
      examDate: "2026-05-14T08:00:00",
      units: []
    },
    {
      id: 'ap_spanish_literature',
      slug: 'ap-spanish-literature',
      name: 'AP Spanish Literature and Culture',
      description: 'Analyze Spanish and Latin American literary works while developing advanced language skills.',
      icon: '/images/ap_spanish_literature_and_culture.svg',
      subject: 'World Languages',
      examDate: "2026-05-13T12:00:00",
      units: []
    },
    {
      id: 'ap_statistics',
      slug: 'ap-statistics',
      name: 'AP Statistics',
      description: 'Learn statistical concepts and methods for collecting, analyzing, and interpreting data in real-world contexts.',
      icon: '/images/ap_statistics.svg',
      subject: 'Mathematics',
      examDate: "2026-05-07T12:00:00",
      units: []
    },
    {
      id: 'ap_united_states_government_politics',
      slug: 'ap-united-states-government-politics',
      name: 'AP U.S. Government and Politics',
      description: 'Study the American political system, constitutional principles, and the role of citizens in democratic society.',
      icon: '/images/ap_united_states_government_and_politics.svg',
      subject: 'Social Studies',
      examDate: "2026-05-05T12:00:00",
      units: []
    },
    {
      id: 'ap_us_history',
      slug: 'ap-us-history',
      name: 'AP U.S. History',
      description: 'Examine American history from pre-Columbian times to present, developing historical analysis and writing skills.',
      icon: '/images/ap_united_states_history.svg',
      subject: 'Social Studies',
      examDate: "2026-05-08T08:00:00",
      units: [
        {
          id: "unit-1",
          title: "Period 1: 1491–1607",
          description: "On a North American continent controlled by American Indians, contact among the peoples of Europe, the Americas, and West Africa created a new world.",
          flashcards: [
            { term: "Columbian Exchange", definition: "The widespread transfer of plants, animals, culture, human populations, technology, and ideas between the Americas, West Africa, and the Old World." },
            { term: "Encomienda System", definition: "A Spanish labor system that rewarded conquerors with the labor of particular groups of conquered non-Christian people." },
          ],
          questions: [
            { question: "The Columbian Exchange was most consequential for which group?", options: ["Europeans", "Native Americans", "Africans", "Asians"], answer: "Native Americans" },
          ]
        },
        {
          id: "unit-2",
          title: "Period 2: 1607-1754",
          description: "Europeans and American Indians maneuvered and fought for dominance, control, and security in North America, and distinctive colonial and native societies emerged.",
          flashcards: [],
          questions: []
        }
    ]
    },
    {
      id: 'ap_world_history',
      slug: 'ap-world-history',
      name: 'AP World History: Modern',
      description: 'Explore global historical processes and connections from 1200 CE to present across different civilizations.',
      icon: '/images/ap_world_history_modern.svg',
      subject: 'Social Studies',
      examDate: "2026-05-07T08:00:00",
      units: []
    },
    {
      id: 'ap_business_principles_personal_finance',
      slug: 'ap-business-principles-personal-finance',
      name: 'AP Business Principles/Personal Finance',
      description: 'Master essential business concepts and develop personal financial literacy skills for real-world application.',
      icon: '💼',
      subject: 'Social Studies',
      comingSoon: true,
      examDate: "2026-05-15T12:00:00",
      units: []
    },
    {
      id: 'ap_cybersecurity',
      slug: 'ap-cybersecurity',
      name: 'AP Cybersecurity',
      description: 'Explore the principles of cybersecurity, including threats, vulnerabilities, and the tools to protect digital assets.',
      icon: '🛡️',
      subject: 'Computer Science',
      comingSoon: true,
      examDate: "2026-05-15T12:00:00",
      units: []
    },
    {
      id: 'honors_algebra_ii',
      slug: 'honors-algebra-ii',
      name: 'Honors Algebra II',
      description: 'An advanced study of algebraic concepts including functions, polynomials, and complex numbers.',
      icon: '📈',
      subject: 'Mathematics',
      examDate: "2026-05-20T12:00:00",
      units: []
    },
    {
      id: 'honors_biology',
      slug: 'honors-biology',
      name: 'Honors Biology',
      description: 'An in-depth exploration of biological systems, from molecular biology to ecology, with an emphasis on inquiry-based learning.',
      icon: '🧬',
      subject: 'Science',
      examDate: "2026-05-20T12:00:00",
      units: []
    },
    {
      id: 'honors_chemistry',
      slug: 'honors-chemistry',
      name: 'Honors Chemistry',
      description: 'A rigorous introduction to chemical principles, including atomic theory, stoichiometry, and thermodynamics.',
      icon: '🧪',
      subject: 'Science',
      examDate: "2026-05-20T12:00:00",
      units: []
    },
    {
      id: 'honors_economics',
      slug: 'honors-economics',
      name: 'Honors Economics',
      description: 'A comprehensive study of microeconomic and macroeconomic principles and their application to real-world scenarios.',
      icon: '💹',
      subject: 'Social Studies',
      examDate: "2026-05-20T12:00:00",
      units: []
    },
    {
      id: 'honors_physics',
      slug: 'honors-physics',
      name: 'Honors Physics',
      description: 'An accelerated study of classical and modern physics, focusing on mechanics, electricity, and magnetism.',
      icon: '⚛️',
      subject: 'Science',
      examDate: "2026-05-20T12:00:00",
      units: []
    },
    {
      id: 'honors_pre_calculus',
      slug: 'honors-pre-calculus',
      name: 'Honors Pre-Calculus',
      description: 'Preparation for calculus through an advanced study of functions, trigonometry, and analytic geometry.',
      icon: '📐',
      subject: 'Mathematics',
      examDate: "2026-05-20T12:00:00",
      units: []
    },
    {
      id: 'honors_statistics',
      slug: 'honors-statistics',
      name: 'Honors Statistics',
      description: 'An advanced introduction to the major concepts and tools for collecting, analyzing, and drawing conclusions from data.',
      icon: '📊',
      subject: 'Mathematics',
      examDate: "2026-05-20T12:00:00",
      units: []
    },
    {
      id: 'honors_us_government',
      slug: 'honors-us-government',
      name: 'Honors US Government',
      description: 'A detailed analysis of the United States government and political system, including its constitutional underpinnings.',
      icon: '🗳️',
      subject: 'Social Studies',
      examDate: "2026-05-20T12:00:00",
      units: []
    },
    {
      id: 'honors_us_history',
      slug: 'honors-us-history',
      name: 'Honors US History',
      description: 'A comprehensive and in-depth survey of American history from the colonial period to the present.',
      icon: '🇺🇸',
      subject: 'Social Studies',
      examDate: "2026-05-20T12:00:00",
      units: []
    },
    {
      id: 'honors_world_history',
      slug: 'honors-world-history',
      name: 'Honors World History',
      description: 'An advanced study of global history, examining patterns of change and continuity across different cultures and eras.',
      icon: '🌎',
      subject: 'Social Studies',
      examDate: "2026-05-20T12:00:00",
      units: []
    }
];

export const getCourseBySlug = (slug: string) => {
  return courses.find((course) => course.slug === slug);
};
