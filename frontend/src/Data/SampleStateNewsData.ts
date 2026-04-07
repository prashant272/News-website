export interface NewsItem {
  id: string | number;
  title: string;
  image?: string;
  category?: string;
  isLive?: boolean;
  isVideo?: boolean;
  isPhoto?: boolean;
  slug?: string;
  date?: string;
  relatedLinks?: string[]; 
}

export interface CategorySection {
  categoryName: string;
  items: NewsItem[];
}

export const stateNewsData: CategorySection[] = [
  {
    categoryName: 'Maharashtra',
    items: [
      {
        id: 'maha-main-1',
        title: "Ajit Pawar plane crash: Police register ADR; AAIB team questions charter firm VSR Ventures officials",
        image: '/images/ajit-pawar-memorial.jpg',
        category: 'Maharashtra',
        slug: 'ajit-pawar-investigation-vsr-ventures',
        date: '1 hour ago',
        relatedLinks: [
          "Ajit Pawar funeral LIVE: Maharashtra Deputy CM accorded full state honours, last rites at 11 am",
          "Ajit Pawar death: Maharashtra ZP, Panchayat Samiti polls to be held as scheduled despite mourning",
          "Baramati mourns: Markets closed as local leaders pay tribute to the late Deputy CM",
          "Aviation experts point to technical glitch in the engine of the Beechcraft King Air"
        ]
      },
      {
        id: 'maha-2',
        title: "Mumbai Coastal Road Phase 2: Traffic updates as new stretch opens for public",
        image: '/images/mumbai-coastal-road.jpg',
        category: 'Maharashtra',
        slug: 'mumbai-coastal-road-phase-2-opening',
        date: '4 hours ago',
        relatedLinks: [
          "Buses to be allowed on Coastal Road from next month; Check fare details",
          "Commuters report 20-minute time saving on Worli-Marine Drive stretch",
          "BMC to install advanced AI cameras for speed monitoring on Coastal Road"
        ]
      }
    ]
  },
  {
    categoryName: 'Uttar Pradesh',
    items: [
      {
        id: 'up-1',
        title: "Ayodhya Ram Mandir: Record 5 lakh devotees visit on second anniversary of Pran Pratishtha",
        image: '/images/ayodhya-anniversary.jpg',
        category: 'Uttar Pradesh',
        slug: 'ayodhya-ram-mandir-anniversary-crowd',
        date: '2 hours ago',
        relatedLinks: [
          "Special 'Aarti' performed at Ayodhya temple to mark 2-year milestone",
          "UP Police deploy drones for crowd management as visitor numbers swell",
          "New tourist facility center inaugurated near Ram Janmabhoomi Path"
        ]
      },
      {
        id: 'up-2',
        title: "UP CM Yogi Adityanath announces 'Kanya Sumangala' grant hike to Rs 25,000 from April",
        category: 'Uttar Pradesh',
        slug: 'up-kanya-sumangala-yojana-hike',
        date: '5 hours ago',
        relatedLinks: [
          "Application process for enhanced Kanya Sumangala grant goes digital",
          "Over 18 lakh girls in UP currently benefit from the welfare scheme",
          "Education department to link school enrollment with Kanya Sumangala portal"
        ]
      }
    ]
  },
  {
    categoryName: 'Odisha',
    items: [
      {
        id: 'odisha-1',
        title: "Odisha Bandh highlights: Normal life disrupted, NNKS workers block Puri-Bhubaneswar road",
        image: '/images/odisha-bandh-updates.jpg',
        category: 'Odisha',
        slug: 'odisha-bandh-road-blockade-updates',
        date: '2 hours ago',
        relatedLinks: [
          "Odisha Bandh today: Are schools, colleges, banks, govt offices closed?",
          "Bhubaneswar-Cuttack Twin City police issues traffic advisory for commuters",
          "Emergency services remained unaffected during day-long state shutdown",
          "Train services on Howrah-Chennai route delayed due to track blockade"
        ]
      }
    ]
  },
  {
    categoryName: 'Bihar',
    items: [
      {
        id: 'bihar-1',
        title: "Nitish Kumar reviews progress of Patna Metro; trial runs on Priority Corridor by late 2026",
        image: '/images/patna-metro-trial.jpg',
        category: 'Bihar',
        slug: 'patna-metro-priority-corridor-trial-run',
        date: '3 hours ago',
        relatedLinks: [
          "Patna Metro Phase 1: Underground tunneling work near Railway Station nears completion",
          "State government to seek additional central funding for Metro Phase 2",
          "New recruitment drive for Patna Metro operations staff announced"
        ]
      },
      {
        id: 'bihar-2',
        title: "Bihar Board Exam 2026: BSEB issues strict guidelines to prevent cheating in Matric exams",
        category: 'Bihar',
        slug: 'bseb-metric-exam-2026-guidelines',
        date: '6 hours ago',
        relatedLinks: [
          "BSEB to use biometric verification for students at all exam centers",
          "Model papers for 2026 Board exams released on official website",
          "Helpline numbers launched for students facing exam-related stress"
        ]
      }
    ]
  },
  {
    categoryName: 'Madhya Pradesh',
    items: [
      {
        id: 'mp-1',
        title: "Kuno National Park: Two more Namibian cheetah cubs born; total population rises to 30",
        image: '/images/kuno-cheetah-cubs.jpg',
        category: 'Madhya Pradesh',
        slug: 'kuno-national-park-cheetah-cubs-born',
        date: '4 hours ago',
        relatedLinks: [
          "Project Cheetah: Second batch of big cats from South Africa likely in March",
          "Tourism in Kuno peaks as safari bookings for the season go full",
          "Local tribal communities engaged as Cheetah Mitras to prevent man-animal conflict"
        ]
      },
      {
        id: 'mp-2',
        title: "Bhopal Metro's 'Orange Line' to be fully operational by Independence Day 2026",
        category: 'Madhya Pradesh',
        slug: 'bhopal-metro-orange-line-operational-date',
        date: '7 hours ago',
        relatedLinks: [
          "Subhash Nagar to Karond stretch: Finishing work on 8 elevated stations underway",
          "Bhopal Metro to offer 'Student Smart Cards' with 50% discount on fares",
          "Solar panels installed on Bhopal Metro station rooftops for green energy"
        ]
      }
    ]
  }
];
