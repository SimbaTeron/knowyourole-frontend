export interface CityTheme {
  city: string;
  state?: string;
  country: string;
  team: string;
  sport: "nfl" | "nba" | "mlb" | "nhl" | "mls" | "soccer" | "college";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  textOnPrimary: "light" | "dark";
  textOnSecondary: "light" | "dark";
}

export interface LocalityTheme {
  name: string;
  team: string;
  primary: string;
  secondary: string;
  accent: string;
  textOnPrimary: "light" | "dark";
  textOnSecondary: "light" | "dark";
}

export const cityThemes: Record<string, CityTheme> = {
  "new york": {
    city: "New York",
    state: "NY",
    country: "US",
    team: "Yankees",
    sport: "mlb",
    colors: { primary: "#0B2265", secondary: "#C0C0C0", accent: "#1C2841" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "brooklyn": {
    city: "Brooklyn",
    state: "NY", 
    country: "US",
    team: "Jets",
    sport: "nfl",
    colors: { primary: "#125740", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "los angeles": {
    city: "Los Angeles",
    state: "CA",
    country: "US",
    team: "Rams",
    sport: "nfl",
    colors: { primary: "#003594", secondary: "#FFA300", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "chicago": {
    city: "Chicago",
    state: "IL",
    country: "US",
    team: "Bears",
    sport: "nfl",
    colors: { primary: "#0B162A", secondary: "#C83803", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "houston": {
    city: "Houston",
    state: "TX",
    country: "US",
    team: "Texans",
    sport: "nfl",
    colors: { primary: "#03202F", secondary: "#A71930", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "phoenix": {
    city: "Phoenix",
    state: "AZ",
    country: "US",
    team: "Cardinals",
    sport: "nfl",
    colors: { primary: "#97233F", secondary: "#000000", accent: "#FFB612" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "philadelphia": {
    city: "Philadelphia",
    state: "PA",
    country: "US",
    team: "Eagles",
    sport: "nfl",
    colors: { primary: "#004C54", secondary: "#A5ACAF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "san antonio": {
    city: "San Antonio",
    state: "TX",
    country: "US",
    team: "Spurs",
    sport: "nba",
    colors: { primary: "#C4CED4", secondary: "#000000", accent: "#EF426F" },
    textOnPrimary: "dark",
    textOnSecondary: "light"
  },
  "san diego": {
    city: "San Diego",
    state: "CA",
    country: "US",
    team: "Padres",
    sport: "mlb",
    colors: { primary: "#2F241D", secondary: "#FFC425", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "dallas": {
    city: "Dallas",
    state: "TX",
    country: "US",
    team: "Cowboys",
    sport: "nfl",
    colors: { primary: "#003594", secondary: "#869397", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "san jose": {
    city: "San Jose",
    state: "CA",
    country: "US",
    team: "Sharks",
    sport: "nhl",
    colors: { primary: "#006D75", secondary: "#EA7200", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "austin": {
    city: "Austin",
    state: "TX",
    country: "US",
    team: "Longhorns",
    sport: "college",
    colors: { primary: "#BF5700", secondary: "#333F48", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "jacksonville": {
    city: "Jacksonville",
    state: "FL",
    country: "US",
    team: "Jaguars",
    sport: "nfl",
    colors: { primary: "#006778", secondary: "#9F792C", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "fort worth": {
    city: "Fort Worth",
    state: "TX",
    country: "US",
    team: "Cowboys",
    sport: "nfl",
    colors: { primary: "#003594", secondary: "#869397", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "columbus": {
    city: "Columbus",
    state: "OH",
    country: "US",
    team: "Blue Jackets",
    sport: "nhl",
    colors: { primary: "#002654", secondary: "#CE1126", accent: "#A4A9AD" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "charlotte": {
    city: "Charlotte",
    state: "NC",
    country: "US",
    team: "Panthers",
    sport: "nfl",
    colors: { primary: "#0085CA", secondary: "#101820", accent: "#BFC0BF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "san francisco": {
    city: "San Francisco",
    state: "CA",
    country: "US",
    team: "49ers",
    sport: "nfl",
    colors: { primary: "#AA0000", secondary: "#B3995D", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "indianapolis": {
    city: "Indianapolis",
    state: "IN",
    country: "US",
    team: "Colts",
    sport: "nfl",
    colors: { primary: "#002C5F", secondary: "#A2AAAD", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "seattle": {
    city: "Seattle",
    state: "WA",
    country: "US",
    team: "Seahawks",
    sport: "nfl",
    colors: { primary: "#002244", secondary: "#69BE28", accent: "#A5ACAF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "denver": {
    city: "Denver",
    state: "CO",
    country: "US",
    team: "Broncos",
    sport: "nfl",
    colors: { primary: "#FB4F14", secondary: "#002244", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "washington": {
    city: "Washington",
    state: "DC",
    country: "US",
    team: "Commanders",
    sport: "nfl",
    colors: { primary: "#5A1414", secondary: "#FFB612", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "boston": {
    city: "Boston",
    state: "MA",
    country: "US",
    team: "Patriots",
    sport: "nfl",
    colors: { primary: "#002244", secondary: "#C60C30", accent: "#B0B7BC" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "nashville": {
    city: "Nashville",
    state: "TN",
    country: "US",
    team: "Titans",
    sport: "nfl",
    colors: { primary: "#0C2340", secondary: "#4B92DB", accent: "#C8102E" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "detroit": {
    city: "Detroit",
    state: "MI",
    country: "US",
    team: "Lions",
    sport: "nfl",
    colors: { primary: "#0076B6", secondary: "#B0B7BC", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "oklahoma city": {
    city: "Oklahoma City",
    state: "OK",
    country: "US",
    team: "Thunder",
    sport: "nba",
    colors: { primary: "#007AC1", secondary: "#EF3B24", accent: "#002D62" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "portland": {
    city: "Portland",
    state: "OR",
    country: "US",
    team: "Trail Blazers",
    sport: "nba",
    colors: { primary: "#E03A3E", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "las vegas": {
    city: "Las Vegas",
    state: "NV",
    country: "US",
    team: "Raiders",
    sport: "nfl",
    colors: { primary: "#000000", secondary: "#A5ACAF", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "memphis": {
    city: "Memphis",
    state: "TN",
    country: "US",
    team: "Grizzlies",
    sport: "nba",
    colors: { primary: "#5D76A9", secondary: "#12173F", accent: "#F5B112" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "louisville": {
    city: "Louisville",
    state: "KY",
    country: "US",
    team: "Cardinals",
    sport: "college",
    colors: { primary: "#AD0000", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "baltimore": {
    city: "Baltimore",
    state: "MD",
    country: "US",
    team: "Ravens",
    sport: "nfl",
    colors: { primary: "#241773", secondary: "#000000", accent: "#9E7C0C" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "milwaukee": {
    city: "Milwaukee",
    state: "WI",
    country: "US",
    team: "Packers",
    sport: "nfl",
    colors: { primary: "#203731", secondary: "#FFB612", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "albuquerque": {
    city: "Albuquerque",
    state: "NM",
    country: "US",
    team: "Lobos",
    sport: "college",
    colors: { primary: "#BA0C2F", secondary: "#A7A8AA", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "tucson": {
    city: "Tucson",
    state: "AZ",
    country: "US",
    team: "Wildcats",
    sport: "college",
    colors: { primary: "#CC0033", secondary: "#003366", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "fresno": {
    city: "Fresno",
    state: "CA",
    country: "US",
    team: "Bulldogs",
    sport: "college",
    colors: { primary: "#DB0032", secondary: "#002E6D", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "sacramento": {
    city: "Sacramento",
    state: "CA",
    country: "US",
    team: "Kings",
    sport: "nba",
    colors: { primary: "#5A2D81", secondary: "#63727A", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "kansas city": {
    city: "Kansas City",
    state: "MO",
    country: "US",
    team: "Chiefs",
    sport: "nfl",
    colors: { primary: "#E31837", secondary: "#FFB81C", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "mesa": {
    city: "Mesa",
    state: "AZ",
    country: "US",
    team: "Cardinals",
    sport: "nfl",
    colors: { primary: "#97233F", secondary: "#000000", accent: "#FFB612" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "atlanta": {
    city: "Atlanta",
    state: "GA",
    country: "US",
    team: "Falcons",
    sport: "nfl",
    colors: { primary: "#A71930", secondary: "#000000", accent: "#A5ACAF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "omaha": {
    city: "Omaha",
    state: "NE",
    country: "US",
    team: "Cornhuskers",
    sport: "college",
    colors: { primary: "#E41C38", secondary: "#F5F1E7", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "miami": {
    city: "Miami",
    state: "FL",
    country: "US",
    team: "Dolphins",
    sport: "nfl",
    colors: { primary: "#008E97", secondary: "#FC4C02", accent: "#005778" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "oakland": {
    city: "Oakland",
    state: "CA",
    country: "US",
    team: "Athletics",
    sport: "mlb",
    colors: { primary: "#003831", secondary: "#EFB21E", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "minneapolis": {
    city: "Minneapolis",
    state: "MN",
    country: "US",
    team: "Vikings",
    sport: "nfl",
    colors: { primary: "#4F2683", secondary: "#FFC62F", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "tulsa": {
    city: "Tulsa",
    state: "OK",
    country: "US",
    team: "Golden Hurricane",
    sport: "college",
    colors: { primary: "#004A8F", secondary: "#C8A14F", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "cleveland": {
    city: "Cleveland",
    state: "OH",
    country: "US",
    team: "Browns",
    sport: "nfl",
    colors: { primary: "#311D00", secondary: "#FF3C00", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "wichita": {
    city: "Wichita",
    state: "KS",
    country: "US",
    team: "Shockers",
    sport: "college",
    colors: { primary: "#FFCD00", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "dark",
    textOnSecondary: "light"
  },
  "arlington": {
    city: "Arlington",
    state: "TX",
    country: "US",
    team: "Cowboys",
    sport: "nfl",
    colors: { primary: "#003594", secondary: "#869397", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "new orleans": {
    city: "New Orleans",
    state: "LA",
    country: "US",
    team: "Saints",
    sport: "nfl",
    colors: { primary: "#D3BC8D", secondary: "#101820", accent: "#FFFFFF" },
    textOnPrimary: "dark",
    textOnSecondary: "light"
  },
  "bakersfield": {
    city: "Bakersfield",
    state: "CA",
    country: "US",
    team: "Condors",
    sport: "nhl",
    colors: { primary: "#CF4520", secondary: "#003087", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "tampa": {
    city: "Tampa",
    state: "FL",
    country: "US",
    team: "Buccaneers",
    sport: "nfl",
    colors: { primary: "#D50A0A", secondary: "#34302B", accent: "#FF7900" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "aurora": {
    city: "Aurora",
    state: "CO",
    country: "US",
    team: "Broncos",
    sport: "nfl",
    colors: { primary: "#FB4F14", secondary: "#002244", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "anaheim": {
    city: "Anaheim",
    state: "CA",
    country: "US",
    team: "Ducks",
    sport: "nhl",
    colors: { primary: "#F47A38", secondary: "#B9975B", accent: "#000000" },
    textOnPrimary: "dark",
    textOnSecondary: "dark"
  },
  "santa ana": {
    city: "Santa Ana",
    state: "CA",
    country: "US",
    team: "Angels",
    sport: "mlb",
    colors: { primary: "#BA0021", secondary: "#003263", accent: "#C4CED4" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "st. louis": {
    city: "St. Louis",
    state: "MO",
    country: "US",
    team: "Cardinals",
    sport: "mlb",
    colors: { primary: "#C41E3A", secondary: "#0C2340", accent: "#FEDB00" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "riverside": {
    city: "Riverside",
    state: "CA",
    country: "US",
    team: "Highlanders",
    sport: "college",
    colors: { primary: "#003DA5", secondary: "#FFB81C", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "pittsburgh": {
    city: "Pittsburgh",
    state: "PA",
    country: "US",
    team: "Steelers",
    sport: "nfl",
    colors: { primary: "#FFB612", secondary: "#101820", accent: "#A5ACAF" },
    textOnPrimary: "dark",
    textOnSecondary: "light"
  },
  "cincinnati": {
    city: "Cincinnati",
    state: "OH",
    country: "US",
    team: "Bengals",
    sport: "nfl",
    colors: { primary: "#FB4F14", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "lexington": {
    city: "Lexington",
    state: "KY",
    country: "US",
    team: "Wildcats",
    sport: "college",
    colors: { primary: "#0033A0", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "stockton": {
    city: "Stockton",
    state: "CA",
    country: "US",
    team: "Kings",
    sport: "nba",
    colors: { primary: "#5A2D81", secondary: "#63727A", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "st. paul": {
    city: "St. Paul",
    state: "MN",
    country: "US",
    team: "Vikings",
    sport: "nfl",
    colors: { primary: "#4F2683", secondary: "#FFC62F", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "newark": {
    city: "Newark",
    state: "NJ",
    country: "US",
    team: "Devils",
    sport: "nhl",
    colors: { primary: "#CE1126", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "greensboro": {
    city: "Greensboro",
    state: "NC",
    country: "US",
    team: "Panthers",
    sport: "nfl",
    colors: { primary: "#0085CA", secondary: "#101820", accent: "#BFC0BF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "buffalo": {
    city: "Buffalo",
    state: "NY",
    country: "US",
    team: "Bills",
    sport: "nfl",
    colors: { primary: "#00338D", secondary: "#C60C30", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "plano": {
    city: "Plano",
    state: "TX",
    country: "US",
    team: "Cowboys",
    sport: "nfl",
    colors: { primary: "#003594", secondary: "#869397", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "lincoln": {
    city: "Lincoln",
    state: "NE",
    country: "US",
    team: "Cornhuskers",
    sport: "college",
    colors: { primary: "#E41C38", secondary: "#F5F1E7", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "orlando": {
    city: "Orlando",
    state: "FL",
    country: "US",
    team: "Magic",
    sport: "nba",
    colors: { primary: "#0077C0", secondary: "#C4CED4", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "irvine": {
    city: "Irvine",
    state: "CA",
    country: "US",
    team: "Chargers",
    sport: "nfl",
    colors: { primary: "#0080C6", secondary: "#FFC20E", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "raleigh": {
    city: "Raleigh",
    state: "NC",
    country: "US",
    team: "Hurricanes",
    sport: "nhl",
    colors: { primary: "#CC0000", secondary: "#000000", accent: "#A2AAAD" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "jersey city": {
    city: "Jersey City",
    state: "NJ",
    country: "US",
    team: "Giants",
    sport: "nfl",
    colors: { primary: "#0B2265", secondary: "#A71930", accent: "#A5ACAF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "chula vista": {
    city: "Chula Vista",
    state: "CA",
    country: "US",
    team: "Padres",
    sport: "mlb",
    colors: { primary: "#2F241D", secondary: "#FFC425", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "toledo": {
    city: "Toledo",
    state: "OH",
    country: "US",
    team: "Rockets",
    sport: "college",
    colors: { primary: "#003E7E", secondary: "#FFCE00", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "fort wayne": {
    city: "Fort Wayne",
    state: "IN",
    country: "US",
    team: "Colts",
    sport: "nfl",
    colors: { primary: "#002C5F", secondary: "#A2AAAD", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "durham": {
    city: "Durham",
    state: "NC",
    country: "US",
    team: "Blue Devils",
    sport: "college",
    colors: { primary: "#003087", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "laredo": {
    city: "Laredo",
    state: "TX",
    country: "US",
    team: "Texans",
    sport: "nfl",
    colors: { primary: "#03202F", secondary: "#A71930", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "lubbock": {
    city: "Lubbock",
    state: "TX",
    country: "US",
    team: "Red Raiders",
    sport: "college",
    colors: { primary: "#CC0000", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "madison": {
    city: "Madison",
    state: "WI",
    country: "US",
    team: "Badgers",
    sport: "college",
    colors: { primary: "#C5050C", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "gilbert": {
    city: "Gilbert",
    state: "AZ",
    country: "US",
    team: "Cardinals",
    sport: "nfl",
    colors: { primary: "#97233F", secondary: "#000000", accent: "#FFB612" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "reno": {
    city: "Reno",
    state: "NV",
    country: "US",
    team: "Wolf Pack",
    sport: "college",
    colors: { primary: "#003366", secondary: "#807F84", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "el paso": {
    city: "El Paso",
    state: "TX",
    country: "US",
    team: "Miners",
    sport: "college",
    colors: { primary: "#FF8200", secondary: "#041E42", accent: "#FFFFFF" },
    textOnPrimary: "dark",
    textOnSecondary: "light"
  },
  "virginia beach": {
    city: "Virginia Beach",
    state: "VA",
    country: "US",
    team: "Commanders",
    sport: "nfl",
    colors: { primary: "#5A1414", secondary: "#FFB612", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "colorado springs": {
    city: "Colorado Springs",
    state: "CO",
    country: "US",
    team: "Broncos",
    sport: "nfl",
    colors: { primary: "#FB4F14", secondary: "#002244", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "glendale": {
    city: "Glendale",
    state: "AZ",
    country: "US",
    team: "Coyotes",
    sport: "nhl",
    colors: { primary: "#8C2633", secondary: "#E2D6B5", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "north las vegas": {
    city: "North Las Vegas",
    state: "NV",
    country: "US",
    team: "Raiders",
    sport: "nfl",
    colors: { primary: "#000000", secondary: "#A5ACAF", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "scottsdale": {
    city: "Scottsdale",
    state: "AZ",
    country: "US",
    team: "Suns",
    sport: "nba",
    colors: { primary: "#1D1160", secondary: "#E56020", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "irving": {
    city: "Irving",
    state: "TX",
    country: "US",
    team: "Cowboys",
    sport: "nfl",
    colors: { primary: "#003594", secondary: "#869397", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "baton rouge": {
    city: "Baton Rouge",
    state: "LA",
    country: "US",
    team: "Tigers",
    sport: "college",
    colors: { primary: "#461D7C", secondary: "#FDD023", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "fremont": {
    city: "Fremont",
    state: "CA",
    country: "US",
    team: "Warriors",
    sport: "nba",
    colors: { primary: "#1D428A", secondary: "#FFC72C", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "richmond": {
    city: "Richmond",
    state: "VA",
    country: "US",
    team: "Commanders",
    sport: "nfl",
    colors: { primary: "#5A1414", secondary: "#FFB612", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "boise": {
    city: "Boise",
    state: "ID",
    country: "US",
    team: "Broncos",
    sport: "college",
    colors: { primary: "#0033A0", secondary: "#D64309", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "san bernardino": {
    city: "San Bernardino",
    state: "CA",
    country: "US",
    team: "Chargers",
    sport: "nfl",
    colors: { primary: "#0080C6", secondary: "#FFC20E", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "spokane": {
    city: "Spokane",
    state: "WA",
    country: "US",
    team: "Gonzaga",
    sport: "college",
    colors: { primary: "#002967", secondary: "#C8102E", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "birmingham al": {
    city: "Birmingham",
    state: "AL",
    country: "US",
    team: "Crimson Tide",
    sport: "college",
    colors: { primary: "#9E1B32", secondary: "#828A8F", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "modesto": {
    city: "Modesto",
    state: "CA",
    country: "US",
    team: "Giants",
    sport: "mlb",
    colors: { primary: "#FD5A1E", secondary: "#27251F", accent: "#EFD19F" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "des moines": {
    city: "Des Moines",
    state: "IA",
    country: "US",
    team: "Cyclones",
    sport: "college",
    colors: { primary: "#C8102E", secondary: "#F1BE48", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "rochester": {
    city: "Rochester",
    state: "NY",
    country: "US",
    team: "Bills",
    sport: "nfl",
    colors: { primary: "#00338D", secondary: "#C60C30", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "tacoma": {
    city: "Tacoma",
    state: "WA",
    country: "US",
    team: "Seahawks",
    sport: "nfl",
    colors: { primary: "#002244", secondary: "#69BE28", accent: "#A5ACAF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "fontana": {
    city: "Fontana",
    state: "CA",
    country: "US",
    team: "Chargers",
    sport: "nfl",
    colors: { primary: "#0080C6", secondary: "#FFC20E", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "salt lake city": {
    city: "Salt Lake City",
    state: "UT",
    country: "US",
    team: "Jazz",
    sport: "nba",
    colors: { primary: "#002B5C", secondary: "#F9A01B", accent: "#00471B" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "moreno valley": {
    city: "Moreno Valley",
    state: "CA",
    country: "US",
    team: "Rams",
    sport: "nfl",
    colors: { primary: "#003594", secondary: "#FFA300", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "fayetteville": {
    city: "Fayetteville",
    state: "AR",
    country: "US",
    team: "Razorbacks",
    sport: "college",
    colors: { primary: "#9D2235", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "worcester": {
    city: "Worcester",
    state: "MA",
    country: "US",
    team: "Patriots",
    sport: "nfl",
    colors: { primary: "#002244", secondary: "#C60C30", accent: "#B0B7BC" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "yonkers": {
    city: "Yonkers",
    state: "NY",
    country: "US",
    team: "Giants",
    sport: "nfl",
    colors: { primary: "#0B2265", secondary: "#A71930", accent: "#A5ACAF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "little rock": {
    city: "Little Rock",
    state: "AR",
    country: "US",
    team: "Razorbacks",
    sport: "college",
    colors: { primary: "#9D2235", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "huntsville": {
    city: "Huntsville",
    state: "AL",
    country: "US",
    team: "Crimson Tide",
    sport: "college",
    colors: { primary: "#9E1B32", secondary: "#828A8F", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },

  "london": {
    city: "London",
    country: "GB",
    team: "Arsenal",
    sport: "soccer",
    colors: { primary: "#EF0107", secondary: "#063672", accent: "#9C824A" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "manchester": {
    city: "Manchester",
    country: "GB",
    team: "Manchester United",
    sport: "soccer",
    colors: { primary: "#DA291C", secondary: "#FBE122", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "liverpool": {
    city: "Liverpool",
    country: "GB",
    team: "Liverpool FC",
    sport: "soccer",
    colors: { primary: "#C8102E", secondary: "#00B2A9", accent: "#F6EB61" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "birmingham uk": {
    city: "Birmingham",
    country: "GB",
    team: "Aston Villa",
    sport: "soccer",
    colors: { primary: "#670E36", secondary: "#95BFE5", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "paris": {
    city: "Paris",
    country: "FR",
    team: "Paris Saint-Germain",
    sport: "soccer",
    colors: { primary: "#004170", secondary: "#DA291C", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "marseille": {
    city: "Marseille",
    country: "FR",
    team: "Olympique Marseille",
    sport: "soccer",
    colors: { primary: "#2FAEE0", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "madrid": {
    city: "Madrid",
    country: "ES",
    team: "Real Madrid",
    sport: "soccer",
    colors: { primary: "#FEBE10", secondary: "#00529F", accent: "#FFFFFF" },
    textOnPrimary: "dark",
    textOnSecondary: "light"
  },
  "barcelona": {
    city: "Barcelona",
    country: "ES",
    team: "FC Barcelona",
    sport: "soccer",
    colors: { primary: "#A50044", secondary: "#004D98", accent: "#EDBB00" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "munich": {
    city: "Munich",
    country: "DE",
    team: "Bayern Munich",
    sport: "soccer",
    colors: { primary: "#DC052D", secondary: "#0066B2", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "berlin": {
    city: "Berlin",
    country: "DE",
    team: "Hertha Berlin",
    sport: "soccer",
    colors: { primary: "#005CA9", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "rome": {
    city: "Rome",
    country: "IT",
    team: "AS Roma",
    sport: "soccer",
    colors: { primary: "#8E1F2F", secondary: "#F0BC42", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "milan": {
    city: "Milan",
    country: "IT",
    team: "AC Milan",
    sport: "soccer",
    colors: { primary: "#FB090B", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "tokyo": {
    city: "Tokyo",
    country: "JP",
    team: "FC Tokyo",
    sport: "soccer",
    colors: { primary: "#013A71", secondary: "#E60012", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "osaka": {
    city: "Osaka",
    country: "JP",
    team: "Gamba Osaka",
    sport: "soccer",
    colors: { primary: "#1D2088", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "toronto": {
    city: "Toronto",
    country: "CA",
    team: "Toronto FC",
    sport: "soccer",
    colors: { primary: "#E31937", secondary: "#B81137", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "vancouver": {
    city: "Vancouver",
    country: "CA",
    team: "Vancouver Whitecaps",
    sport: "soccer",
    colors: { primary: "#00245D", secondary: "#9DC3E6", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "montreal": {
    city: "Montreal",
    country: "CA",
    team: "CF Montreal",
    sport: "soccer",
    colors: { primary: "#000000", secondary: "#7AB2DD", accent: "#848E99" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "sydney": {
    city: "Sydney",
    country: "AU",
    team: "Sydney FC",
    sport: "soccer",
    colors: { primary: "#0B3FA0", secondary: "#87CEEB", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "melbourne": {
    city: "Melbourne",
    country: "AU",
    team: "Melbourne Victory",
    sport: "soccer",
    colors: { primary: "#00285E", secondary: "#FFFFFF", accent: "#A9A9A9" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "mexico city": {
    city: "Mexico City",
    country: "MX",
    team: "Club America",
    sport: "soccer",
    colors: { primary: "#FFD200", secondary: "#0A3161", accent: "#FFFFFF" },
    textOnPrimary: "dark",
    textOnSecondary: "light"
  },
  "buenos aires": {
    city: "Buenos Aires",
    country: "AR",
    team: "Boca Juniors",
    sport: "soccer",
    colors: { primary: "#003DA5", secondary: "#FFCD00", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "rio de janeiro": {
    city: "Rio de Janeiro",
    country: "BR",
    team: "Flamengo",
    sport: "soccer",
    colors: { primary: "#E1001E", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "sao paulo": {
    city: "Sao Paulo",
    country: "BR",
    team: "Corinthians",
    sport: "soccer",
    colors: { primary: "#000000", secondary: "#FFFFFF", accent: "#C4161C" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "amsterdam": {
    city: "Amsterdam",
    country: "NL",
    team: "Ajax",
    sport: "soccer",
    colors: { primary: "#C8102E", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "mumbai": {
    city: "Mumbai",
    country: "IN",
    team: "Mumbai City FC",
    sport: "soccer",
    colors: { primary: "#0079C1", secondary: "#EE2A24", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "delhi": {
    city: "Delhi",
    country: "IN",
    team: "Delhi Dynamos",
    sport: "soccer",
    colors: { primary: "#FDB913", secondary: "#E31837", accent: "#000000" },
    textOnPrimary: "dark",
    textOnSecondary: "light"
  },
  "dubai": {
    city: "Dubai",
    country: "AE",
    team: "Al-Wasl",
    sport: "soccer",
    colors: { primary: "#FFD700", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "dark",
    textOnSecondary: "light"
  },
  "shanghai": {
    city: "Shanghai",
    country: "CN",
    team: "Shanghai Port",
    sport: "soccer",
    colors: { primary: "#C8102E", secondary: "#FFFFFF", accent: "#003DA5" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "beijing": {
    city: "Beijing",
    country: "CN",
    team: "Beijing Guoan",
    sport: "soccer",
    colors: { primary: "#00A651", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "seoul": {
    city: "Seoul",
    country: "KR",
    team: "FC Seoul",
    sport: "soccer",
    colors: { primary: "#C8102E", secondary: "#000000", accent: "#FFFFFF" },
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  "cape town": {
    city: "Cape Town",
    country: "ZA",
    team: "Cape Town City",
    sport: "soccer",
    colors: { primary: "#00BFFF", secondary: "#FFFFFF", accent: "#000000" },
    textOnPrimary: "dark",
    textOnSecondary: "dark"
  }
};

export const genericThemes: Record<string, LocalityTheme> = {
  northeast: {
    name: "Northeast",
    team: "Classic American",
    primary: "#1E3A5F",
    secondary: "#C5B358",
    accent: "#FFFFFF",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  southeast: {
    name: "Southeast",
    team: "Southern Pride",
    primary: "#8B0000",
    secondary: "#D4AF37",
    accent: "#FFFFFF",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  midwest: {
    name: "Midwest",
    team: "Heartland",
    primary: "#B22234",
    secondary: "#FFD700",
    accent: "#3C3B6E",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  southwest: {
    name: "Southwest",
    team: "Desert Sun",
    primary: "#E35205",
    secondary: "#00338D",
    accent: "#F5DEB3",
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  west: {
    name: "West Coast",
    team: "Pacific Pride",
    primary: "#003087",
    secondary: "#69B3E7",
    accent: "#FFB612",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  mountain: {
    name: "Mountain",
    team: "Rocky Mountain",
    primary: "#4B0082",
    secondary: "#87CEEB",
    accent: "#FFFFFF",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  pacific: {
    name: "Pacific Northwest",
    team: "Emerald City",
    primary: "#046A38",
    secondary: "#A7FC00",
    accent: "#FFFFFF",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  europe: {
    name: "European",
    team: "Continental",
    primary: "#003399",
    secondary: "#FFCC00",
    accent: "#FFFFFF",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  asia: {
    name: "Asian",
    team: "Eastern",
    primary: "#C41E3A",
    secondary: "#FFD700",
    accent: "#FFFFFF",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  oceania: {
    name: "Oceania",
    team: "Pacific Islands",
    primary: "#00A8E8",
    secondary: "#003459",
    accent: "#FFFFFF",
    textOnPrimary: "light",
    textOnSecondary: "light"
  },
  southamerica: {
    name: "South American",
    team: "Latin Spirit",
    primary: "#009B3A",
    secondary: "#FEDF00",
    accent: "#002776",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  africa: {
    name: "African",
    team: "Safari",
    primary: "#007A4D",
    secondary: "#FFB612",
    accent: "#000000",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  default: {
    name: "Global",
    team: "World Citizen",
    primary: "#2C5530",
    secondary: "#C9A227",
    accent: "#FFFFFF",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  }
};

const usStateToRegion: Record<string, string> = {
  "ME": "northeast", "NH": "northeast", "VT": "northeast", "MA": "northeast",
  "RI": "northeast", "CT": "northeast", "NY": "northeast", "NJ": "northeast",
  "PA": "northeast", "DE": "northeast", "MD": "northeast",
  "VA": "southeast", "WV": "southeast", "NC": "southeast", "SC": "southeast",
  "GA": "southeast", "FL": "southeast", "AL": "southeast", "MS": "southeast",
  "TN": "southeast", "KY": "southeast", "LA": "southeast", "AR": "southeast",
  "OH": "midwest", "MI": "midwest", "IN": "midwest", "IL": "midwest",
  "WI": "midwest", "MN": "midwest", "IA": "midwest", "MO": "midwest",
  "ND": "midwest", "SD": "midwest", "NE": "midwest", "KS": "midwest",
  "TX": "southwest", "OK": "southwest", "NM": "southwest", "AZ": "southwest",
  "CO": "mountain", "WY": "mountain", "MT": "mountain", "ID": "mountain",
  "UT": "mountain", "NV": "mountain",
  "WA": "pacific", "OR": "pacific",
  "CA": "west", "HI": "west", "AK": "pacific"
};

const countryToRegion: Record<string, string> = {
  "US": "default",
  "CA": "northeast",
  "GB": "europe", "UK": "europe",
  "FR": "europe",
  "DE": "europe",
  "IT": "europe",
  "ES": "europe",
  "NL": "europe",
  "JP": "asia",
  "CN": "asia",
  "KR": "asia",
  "IN": "asia",
  "AU": "oceania",
  "NZ": "oceania",
  "BR": "southamerica",
  "AR": "southamerica",
  "MX": "southamerica",
  "ZA": "africa",
  "AE": "asia"
};

const cityAliases: Record<string, string> = {
  "new york city": "new york",
  "nyc": "new york",
  "manhattan": "new york",
  "la": "los angeles",
  "beverly hills": "los angeles",
  "hollywood": "los angeles",
  "santa monica": "los angeles",
  "long beach": "los angeles",
  "pasadena": "los angeles",
  "south loop": "chicago",
  "downtown chicago": "chicago",
  "sf": "san francisco",
  "downtown dallas": "dallas",
  "downtown phoenix": "phoenix",
  "downtown denver": "denver",
  "downtown seattle": "seattle",
  "downtown boston": "boston",
  "downtown miami": "miami",
  "miami beach": "miami",
  "downtown atlanta": "atlanta",
  "downtown detroit": "detroit",
  "downtown minneapolis": "minneapolis",
  "downtown san diego": "san diego",
  "downtown tampa": "tampa",
  "downtown baltimore": "baltimore",
  "downtown pittsburgh": "pittsburgh",
  "downtown cleveland": "cleveland",
  "downtown new orleans": "new orleans",
  "downtown las vegas": "las vegas",
  "the strip": "las vegas",
  "downtown portland": "portland",
  "downtown austin": "austin",
  "downtown nashville": "nashville",
  "downtown indianapolis": "indianapolis",
  "downtown charlotte": "charlotte",
  "downtown jacksonville": "jacksonville",
  "downtown memphis": "memphis",
  "downtown buffalo": "buffalo",
  "downtown cincinnati": "cincinnati",
  "downtown kansas city": "kansas city",
};

export function getCityTheme(city: string, state?: string, country?: string): CityTheme | null {
  const normalizedCity = city.toLowerCase().trim();
  
  if (normalizedCity === "birmingham") {
    if (state?.toUpperCase() === "AL" || country?.toUpperCase() === "US") {
      return cityThemes["birmingham al"] || null;
    }
    if (country?.toUpperCase() === "GB" || country?.toUpperCase() === "UK") {
      return cityThemes["birmingham uk"] || null;
    }
  }
  
  if (cityThemes[normalizedCity]) {
    return cityThemes[normalizedCity];
  }
  
  if (cityAliases[normalizedCity]) {
    return cityThemes[cityAliases[normalizedCity]] || null;
  }
  
  return null;
}

export function getRegionalTheme(state?: string, country?: string): LocalityTheme {
  if (state && usStateToRegion[state.toUpperCase()]) {
    return genericThemes[usStateToRegion[state.toUpperCase()]];
  }
  
  if (country && countryToRegion[country.toUpperCase()]) {
    return genericThemes[countryToRegion[country.toUpperCase()]];
  }
  
  return genericThemes.default;
}

const stateThemeOverrides: Record<string, LocalityTheme> = {
  "CA": {
    name: "California",
    team: "Golden State",
    primary: "#C8102E",
    secondary: "#FFD700",
    accent: "#FFFFFF",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  },
  "NY": {
    name: "New York",
    team: "Yankees",
    primary: "#003087",
    secondary: "#FFFFFF",
    accent: "#C4CED4",
    textOnPrimary: "light",
    textOnSecondary: "dark"
  }
};

export function getLocalityTheme(city: string, state?: string, country?: string): LocalityTheme {
  if (state) {
    const upperState = state.toUpperCase();
    if (stateThemeOverrides[upperState]) {
      return stateThemeOverrides[upperState];
    }
  }
  
  const cityTheme = getCityTheme(city, state, country);
  
  if (cityTheme) {
    return {
      name: cityTheme.city,
      team: cityTheme.team,
      primary: cityTheme.colors.primary,
      secondary: cityTheme.colors.secondary,
      accent: cityTheme.colors.accent,
      textOnPrimary: cityTheme.textOnPrimary,
      textOnSecondary: cityTheme.textOnSecondary
    };
  }
  
  return getRegionalTheme(state, country);
}

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function getContrastColor(hex: string): "light" | "dark" {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "light";
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "dark" : "light";
}
