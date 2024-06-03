let cache = {};

export const fetchData = async (startDate, endDate) => {
  const cacheKey = `${startDate.toISOString()}_${endDate.toISOString()}`;

  // Check cache first
  if (cache[cacheKey]) {
    console.log(`Cache hit for ${cacheKey}`);
    return cache[cacheKey];
  }

  // Simulate data fetching
  const data = generateData(startDate, endDate);
  cache[cacheKey] = data;
  console.log(`Cache miss for ${cacheKey}, data fetched`, data);
  return data;
};

const generateData = (startDate, endDate) => {
  const data = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    data.push({
      date: new Date(currentDate),
      value: Math.floor(Math.random() * 100),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};
