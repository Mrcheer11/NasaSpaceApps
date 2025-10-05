export async function getAllNeosData(date, apiKey = "pWBIQYyI27c1H9lcl3AlxW1b8N5v20SBn4KpD0iA") {
  const res = await fetch(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`
  );
  const data = await res.json();

  const neos = Object.values(data.near_earth_objects).flat();

  const allNeos = neos.map((obj) => {
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

  return allNeos;
}
