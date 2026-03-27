const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const LiveMatch = require(path.join(__dirname, '..', 'backend', 'Models', 'LiveMatch'));

const matchesInput = [
  {
    "matchName": "Royal Challengers Bengaluru vs Sunrisers Hyderabad",
    "team1": "Royal Challengers Bengaluru",
    "team2": "Sunrisers Hyderabad",
    "date": "2026-03-28",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "M Chinnaswamy Stadium, Bengaluru"
  },
  {
    "matchName": "Mumbai Indians vs Kolkata Knight Riders",
    "team1": "Mumbai Indians",
    "team2": "Kolkata Knight Riders",
    "date": "2026-03-29",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Wankhede Stadium, Mumbai"
  },
  {
    "matchName": "Rajasthan Royals vs Chennai Super Kings",
    "team1": "Rajasthan Royals",
    "team2": "Chennai Super Kings",
    "date": "2026-03-30",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "ACA Stadium, Guwahati"
  },
  {
    "matchName": "Punjab Kings vs Gujarat Titans",
    "team1": "Punjab Kings",
    "team2": "Gujarat Titans",
    "date": "2026-03-31",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "New International Cricket Stadium, New Chandigarh"
  },
  {
    "matchName": "Lucknow Super Giants vs Delhi Capitals",
    "team1": "Lucknow Super Giants",
    "team2": "Delhi Capitals",
    "date": "2026-04-01",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Ekana Cricket Stadium, Lucknow"
  },
  {
    "matchName": "Kolkata Knight Riders vs Sunrisers Hyderabad",
    "team1": "Kolkata Knight Riders",
    "team2": "Sunrisers Hyderabad",
    "date": "2026-04-02",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Eden Gardens, Kolkata"
  },
  {
    "matchName": "Chennai Super Kings vs Punjab Kings",
    "team1": "Chennai Super Kings",
    "team2": "Punjab Kings",
    "date": "2026-04-03",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "MA Chidambaram Stadium, Chennai"
  },
  {
    "matchName": "Delhi Capitals vs Mumbai Indians",
    "team1": "Delhi Capitals",
    "team2": "Mumbai Indians",
    "date": "2026-04-04",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "Arun Jaitley Stadium, Delhi"
  },
  {
    "matchName": "Gujarat Titans vs Rajasthan Royals",
    "team1": "Gujarat Titans",
    "team2": "Rajasthan Royals",
    "date": "2026-04-04",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Narendra Modi Stadium, Ahmedabad"
  },
  {
    "matchName": "Sunrisers Hyderabad vs Lucknow Super Giants",
    "team1": "Sunrisers Hyderabad",
    "team2": "Lucknow Super Giants",
    "date": "2026-04-05",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "Rajiv Gandhi International Stadium, Hyderabad"
  },
  {
    "matchName": "Royal Challengers Bengaluru vs Chennai Super Kings",
    "team1": "Royal Challengers Bengaluru",
    "team2": "Chennai Super Kings",
    "date": "2026-04-05",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "M Chinnaswamy Stadium, Bengaluru"
  },
  {
    "matchName": "Kolkata Knight Riders vs Punjab Kings",
    "team1": "Kolkata Knight Riders",
    "team2": "Punjab Kings",
    "date": "2026-04-06",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Eden Gardens, Kolkata"
  },
  {
    "matchName": "Rajasthan Royals vs Mumbai Indians",
    "team1": "Rajasthan Royals",
    "team2": "Mumbai Indians",
    "date": "2026-04-07",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "ACA Stadium, Guwahati"
  },
  {
    "matchName": "Delhi Capitals vs Gujarat Titans",
    "team1": "Delhi Capitals",
    "team2": "Gujarat Titans",
    "date": "2026-04-08",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Arun Jaitley Stadium, Delhi"
  },
  {
    "matchName": "Kolkata Knight Riders vs Lucknow Super Giants",
    "team1": "Kolkata Knight Riders",
    "team2": "Lucknow Super Giants",
    "date": "2026-04-09",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Eden Gardens, Kolkata"
  },
  {
    "matchName": "Rajasthan Royals vs Royal Challengers Bengaluru",
    "team1": "Rajasthan Royals",
    "team2": "Royal Challengers Bengaluru",
    "date": "2026-04-10",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "ACA Stadium, Guwahati"
  },
  {
    "matchName": "Punjab Kings vs Sunrisers Hyderabad",
    "team1": "Punjab Kings",
    "team2": "Sunrisers Hyderabad",
    "date": "2026-04-11",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "New Chandigarh Stadium"
  },
  {
    "matchName": "Chennai Super Kings vs Delhi Capitals",
    "team1": "Chennai Super Kings",
    "team2": "Delhi Capitals",
    "date": "2026-04-11",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "MA Chidambaram Stadium, Chennai"
  },
  {
    "matchName": "Lucknow Super Giants vs Gujarat Titans",
    "team1": "Lucknow Super Giants",
    "team2": "Gujarat Titans",
    "date": "2026-04-12",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "Ekana Cricket Stadium, Lucknow"
  },
  {
    "matchName": "Mumbai Indians vs Royal Challengers Bengaluru",
    "team1": "Mumbai Indians",
    "team2": "Royal Challengers Bengaluru",
    "date": "2026-04-12",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Wankhede Stadium, Mumbai"
  },
  {
    "matchName": "Sunrisers Hyderabad vs Rajasthan Royals",
    "team1": "Sunrisers Hyderabad",
    "team2": "Rajasthan Royals",
    "date": "2026-04-13",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Rajiv Gandhi International Stadium, Hyderabad"
  },
  {
    "matchName": "Chennai Super Kings vs Kolkata Knight Riders",
    "team1": "Chennai Super Kings",
    "team2": "Kolkata Knight Riders",
    "date": "2026-04-14",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "MA Chidambaram Stadium, Chennai"
  },
  {
    "matchName": "Royal Challengers Bengaluru vs Lucknow Super Giants",
    "team1": "Royal Challengers Bengaluru",
    "team2": "Lucknow Super Giants",
    "date": "2026-04-15",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "M Chinnaswamy Stadium, Bengaluru"
  },
  {
    "matchName": "Mumbai Indians vs Punjab Kings",
    "team1": "Mumbai Indians",
    "team2": "Punjab Kings",
    "date": "2026-04-16",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Wankhede Stadium, Mumbai"
  },
  {
    "matchName": "Gujarat Titans vs Kolkata Knight Riders",
    "team1": "Gujarat Titans",
    "team2": "Kolkata Knight Riders",
    "date": "2026-04-17",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Narendra Modi Stadium, Ahmedabad"
  },
  {
    "matchName": "Royal Challengers Bengaluru vs Delhi Capitals",
    "team1": "Royal Challengers Bengaluru",
    "team2": "Delhi Capitals",
    "date": "2026-04-18",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "M Chinnaswamy Stadium, Bengaluru"
  },
  {
    "matchName": "Sunrisers Hyderabad vs Chennai Super Kings",
    "team1": "Sunrisers Hyderabad",
    "team2": "Chennai Super Kings",
    "date": "2026-04-18",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Rajiv Gandhi International Stadium, Hyderabad"
  },
  {
    "matchName": "Kolkata Knight Riders vs Rajasthan Royals",
    "team1": "Kolkata Knight Riders",
    "team2": "Rajasthan Royals",
    "date": "2026-04-19",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "Eden Gardens, Kolkata"
  },
  {
    "matchName": "Punjab Kings vs Lucknow Super Giants",
    "team1": "Punjab Kings",
    "team2": "Lucknow Super Giants",
    "date": "2026-04-19",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "New Chandigarh Stadium"
  },
  {
    "matchName": "Gujarat Titans vs Mumbai Indians",
    "team1": "Gujarat Titans",
    "team2": "Mumbai Indians",
    "date": "2026-04-20",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Narendra Modi Stadium, Ahmedabad"
  },
  {
    "matchName": "Sunrisers Hyderabad vs Delhi Capitals",
    "team1": "Sunrisers Hyderabad",
    "team2": "Delhi Capitals",
    "date": "2026-04-21",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Rajiv Gandhi International Stadium, Hyderabad"
  },
  {
    "matchName": "Lucknow Super Giants vs Rajasthan Royals",
    "team1": "Lucknow Super Giants",
    "team2": "Rajasthan Royals",
    "date": "2026-04-22",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Ekana Cricket Stadium, Lucknow"
  },
  {
    "matchName": "Mumbai Indians vs Chennai Super Kings",
    "team1": "Mumbai Indians",
    "team2": "Chennai Super Kings",
    "date": "2026-04-23",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Wankhede Stadium, Mumbai"
  },
  {
    "matchName": "Royal Challengers Bengaluru vs Gujarat Titans",
    "team1": "Royal Challengers Bengaluru",
    "team2": "Gujarat Titans",
    "date": "2026-04-24",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "M Chinnaswamy Stadium, Bengaluru"
  },
  {
    "matchName": "Delhi Capitals vs Punjab Kings",
    "team1": "Delhi Capitals",
    "team2": "Punjab Kings",
    "date": "2026-04-25",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "Arun Jaitley Stadium, Delhi"
  },
  {
    "matchName": "Rajasthan Royals vs Sunrisers Hyderabad",
    "team1": "Rajasthan Royals",
    "team2": "Sunrisers Hyderabad",
    "date": "2026-04-25",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Sawai Mansingh Stadium, Jaipur"
  },
  {
    "matchName": "Gujarat Titans vs Chennai Super Kings",
    "team1": "Gujarat Titans",
    "team2": "Chennai Super Kings",
    "date": "2026-04-26",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "Narendra Modi Stadium, Ahmedabad"
  },
  {
    "matchName": "Lucknow Super Giants vs Kolkata Knight Riders",
    "team1": "Lucknow Super Giants",
    "team2": "Kolkata Knight Riders",
    "date": "2026-04-26",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Ekana Cricket Stadium, Lucknow"
  },
  {
    "matchName": "Delhi Capitals vs Royal Challengers Bengaluru",
    "team1": "Delhi Capitals",
    "team2": "Royal Challengers Bengaluru",
    "date": "2026-04-27",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Arun Jaitley Stadium, Delhi"
  },
  {
    "matchName": "Punjab Kings vs Rajasthan Royals",
    "team1": "Punjab Kings",
    "team2": "Rajasthan Royals",
    "date": "2026-04-28",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "New Chandigarh Stadium"
  },
  {
    "matchName": "Mumbai Indians vs Sunrisers Hyderabad",
    "team1": "Mumbai Indians",
    "team2": "Sunrisers Hyderabad",
    "date": "2026-04-29",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Wankhede Stadium, Mumbai"
  },
  {
    "matchName": "Gujarat Titans vs Royal Challengers Bengaluru",
    "team1": "Gujarat Titans",
    "team2": "Royal Challengers Bengaluru",
    "date": "2026-04-30",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Narendra Modi Stadium, Ahmedabad"
  },
  {
    "matchName": "Rajasthan Royals vs Delhi Capitals",
    "team1": "Rajasthan Royals",
    "team2": "Delhi Capitals",
    "date": "2026-05-01",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Sawai Mansingh Stadium, Jaipur"
  },
  {
    "matchName": "Chennai Super Kings vs Mumbai Indians",
    "team1": "Chennai Super Kings",
    "team2": "Mumbai Indians",
    "date": "2026-05-02",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "MA Chidambaram Stadium, Chennai"
  },
  {
    "matchName": "Sunrisers Hyderabad vs Kolkata Knight Riders",
    "team1": "Sunrisers Hyderabad",
    "team2": "Kolkata Knight Riders",
    "date": "2026-05-03",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "Rajiv Gandhi International Stadium, Hyderabad"
  },
  {
    "matchName": "Gujarat Titans vs Punjab Kings",
    "team1": "Gujarat Titans",
    "team2": "Punjab Kings",
    "date": "2026-05-03",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Narendra Modi Stadium, Ahmedabad"
  },
  {
    "matchName": "Mumbai Indians vs Lucknow Super Giants",
    "team1": "Mumbai Indians",
    "team2": "Lucknow Super Giants",
    "date": "2026-05-04",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Wankhede Stadium, Mumbai"
  },
  {
    "matchName": "Delhi Capitals vs Chennai Super Kings",
    "team1": "Delhi Capitals",
    "team2": "Chennai Super Kings",
    "date": "2026-05-05",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Arun Jaitley Stadium, Delhi"
  },
  {
    "matchName": "Sunrisers Hyderabad vs Punjab Kings",
    "team1": "Sunrisers Hyderabad",
    "team2": "Punjab Kings",
    "date": "2026-05-06",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Rajiv Gandhi International Stadium, Hyderabad"
  },
  {
    "matchName": "Lucknow Super Giants vs Royal Challengers Bengaluru",
    "team1": "Lucknow Super Giants",
    "team2": "Royal Challengers Bengaluru",
    "date": "2026-05-07",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Ekana Cricket Stadium, Lucknow"
  },
  {
    "matchName": "Delhi Capitals vs Kolkata Knight Riders",
    "team1": "Delhi Capitals",
    "team2": "Kolkata Knight Riders",
    "date": "2026-05-08",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Arun Jaitley Stadium, Delhi"
  },
  {
    "matchName": "Rajasthan Royals vs Gujarat Titans",
    "team1": "Rajasthan Royals",
    "team2": "Gujarat Titans",
    "date": "2026-05-09",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Sawai Mansingh Stadium, Jaipur"
  },
  {
    "matchName": "Chennai Super Kings vs Lucknow Super Giants",
    "team1": "Chennai Super Kings",
    "team2": "Lucknow Super Giants",
    "date": "2026-05-10",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "MA Chidambaram Stadium, Chennai"
  },
  {
    "matchName": "Royal Challengers Bengaluru vs Mumbai Indians",
    "team1": "Royal Challengers Bengaluru",
    "team2": "Mumbai Indians",
    "date": "2026-05-10",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Raipur Stadium"
  },
  {
    "matchName": "Punjab Kings vs Delhi Capitals",
    "team1": "Punjab Kings",
    "team2": "Delhi Capitals",
    "date": "2026-05-11",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Dharamshala Stadium"
  },
  {
    "matchName": "Gujarat Titans vs Sunrisers Hyderabad",
    "team1": "Gujarat Titans",
    "team2": "Sunrisers Hyderabad",
    "date": "2026-05-12",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Narendra Modi Stadium, Ahmedabad"
  },
  {
    "matchName": "Royal Challengers Bengaluru vs Kolkata Knight Riders",
    "team1": "Royal Challengers Bengaluru",
    "team2": "Kolkata Knight Riders",
    "date": "2026-05-13",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Raipur Stadium"
  },
  {
    "matchName": "Punjab Kings vs Mumbai Indians",
    "team1": "Punjab Kings",
    "team2": "Mumbai Indians",
    "date": "2026-05-14",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Dharamshala Stadium"
  },
  {
    "matchName": "Lucknow Super Giants vs Chennai Super Kings",
    "team1": "Lucknow Super Giants",
    "team2": "Chennai Super Kings",
    "date": "2026-05-15",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Ekana Cricket Stadium, Lucknow"
  },
  {
    "matchName": "Kolkata Knight Riders vs Gujarat Titans",
    "team1": "Kolkata Knight Riders",
    "team2": "Gujarat Titans",
    "date": "2026-05-16",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Eden Gardens, Kolkata"
  },
  {
    "matchName": "Punjab Kings vs Royal Challengers Bengaluru",
    "team1": "Punjab Kings",
    "team2": "Royal Challengers Bengaluru",
    "date": "2026-05-17",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "Dharamshala Stadium"
  },
  {
    "matchName": "Delhi Capitals vs Rajasthan Royals",
    "team1": "Delhi Capitals",
    "team2": "Rajasthan Royals",
    "date": "2026-05-17",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Arun Jaitley Stadium, Delhi"
  },
  {
    "matchName": "Chennai Super Kings vs Sunrisers Hyderabad",
    "team1": "Chennai Super Kings",
    "team2": "Sunrisers Hyderabad",
    "date": "2026-05-18",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "MA Chidambaram Stadium, Chennai"
  },
  {
    "matchName": "Rajasthan Royals vs Lucknow Super Giants",
    "team1": "Rajasthan Royals",
    "team2": "Lucknow Super Giants",
    "date": "2026-05-19",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Sawai Mansingh Stadium, Jaipur"
  },
  {
    "matchName": "Kolkata Knight Riders vs Mumbai Indians",
    "team1": "Kolkata Knight Riders",
    "team2": "Mumbai Indians",
    "date": "2026-05-20",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Eden Gardens, Kolkata"
  },
  {
    "matchName": "Chennai Super Kings vs Gujarat Titans",
    "team1": "Chennai Super Kings",
    "team2": "Gujarat Titans",
    "date": "2026-05-21",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "MA Chidambaram Stadium, Chennai"
  },
  {
    "matchName": "Sunrisers Hyderabad vs Royal Challengers Bengaluru",
    "team1": "Sunrisers Hyderabad",
    "team2": "Royal Challengers Bengaluru",
    "date": "2026-05-22",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Rajiv Gandhi International Stadium, Hyderabad"
  },
  {
    "matchName": "Lucknow Super Giants vs Punjab Kings",
    "team1": "Lucknow Super Giants",
    "team2": "Punjab Kings",
    "date": "2026-05-23",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Ekana Cricket Stadium, Lucknow"
  },
  {
    "matchName": "Mumbai Indians vs Rajasthan Royals",
    "team1": "Mumbai Indians",
    "team2": "Rajasthan Royals",
    "date": "2026-05-24",
    "startTime": "03:30 PM",
    "category": "upcoming",
    "venue": "Wankhede Stadium, Mumbai"
  },
  {
    "matchName": "Kolkata Knight Riders vs Delhi Capitals",
    "team1": "Kolkata Knight Riders",
    "team2": "Delhi Capitals",
    "date": "2026-05-24",
    "startTime": "07:30 PM",
    "category": "upcoming",
    "venue": "Eden Gardens, Kolkata"
  }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB.");

    let inserted = 0;
    for (const m of matchesInput) {
      const id = `manual-${m.team1.substring(0,3)}-${m.team2.substring(0,3)}-${m.date}`.replace(/\s+/g, '-').toLowerCase();
      
      const matchData = {
        id,
        name: m.matchName,
        venue: m.venue,
        date: m.date,
        startTime: m.startTime,
        teams: [m.team1, m.team2],
        category: 'upcoming',
        showInUpcoming: true,
        isManual: true,
        isDiscoveryOnly: false,
        status: `${m.startTime} IST`,
        matchStarted: false,
        matchEnded: false,
        lastUpdated: new Date()
      };

      await LiveMatch.findOneAndUpdate({ id }, { $set: matchData }, { upsert: true });
      inserted++;
    }

    console.log(`Successfully synced ${inserted} matches.`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

run();
