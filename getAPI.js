export async function getAsteroidData(date, apiKey = "DEMO_KEY") {
  const res = await fetch(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`
  );
  const data = await res.json();

  const neos = Object.values(data.near_earth_objects).flat();

  const asteroids = neos.map((obj) => {
    const name = obj.name;
    const is_hazardous = obj.is_potentially_hazardous_asteroid;
    const diameter =
      (obj.estimated_diameter.kilometers.estimated_diameter_min +
        obj.estimated_diameter.kilometers.estimated_diameter_max) / 2;

    const approach = obj.close_approach_data[0];
    const velocity = parseFloat(approach.relative_velocity.kilometers_per_second);
    const miss_dist = parseFloat(approach.miss_distance.kilometers);

    const a = miss_dist / 100000; // scaled orbit size
    const b = a * 0.8;
    const angular_speed = velocity / 50000;
    const angle = Math.random() * Math.PI * 2;

    return {
      name,
      is_hazardous,
      diameter_km: diameter,
      velocity_kps: velocity,
      miss_dist_km: miss_dist,
      orbit: {
        a,
        b,
        angular_speed,
        angle,
      },
    };
  });

  return asteroids;
}

// Example usage:
(async () => {
  const data = await getAsteroidData("2025-09-25", "DEMO_KEY");

  // Now `data` is a real array of objects you can access
  console.log(data[0].name); // e.g., "(2025 AB)"
  console.log(data[0].orbit.a); // semi-major axis value
})();
