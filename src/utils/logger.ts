export const logger = {
    info: (...args: any[]): void => {
      console.log(new Date().toISOString(), ...args);
    },
    error: (...args: any[]): void => {
      console.error(new Date().toISOString(), ...args);
    }
  };