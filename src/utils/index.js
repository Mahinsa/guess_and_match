export const duplicateArray = (arr) => {
  return [...arr.map((rows) => [...rows])];
};

// Function to generate random number
export const randomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};
