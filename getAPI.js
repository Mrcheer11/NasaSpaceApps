
export async function getAllNeosData(date, apiKey = "pWBIQYyI27c1H9lcl3AlxW1b8N5v20SBn4KpD0iA") {
  const response = await fetch(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`
  );
  const data = await response.json();

  const neos = Object.values(data.near_earth_objects).flat();

  const allNeos = neos.map((obj) => {
    const name = obj.name;
    const id = obj.id;
    const is_hazardous = obj.is_potentially_hazardous_asteroid;
    const diameter =
      (obj.estimated_diameter.kilometers.estimated_diameter_min +
        obj.estimated_diameter.kilometers.estimated_diameter_max) / 2;

    const approach = obj.close_approach_data[0];
    const velocity = parseFloat(approach.relative_velocity.kilometers_per_second);
    const miss_dist = parseFloat(approach.miss_distance.kilometers);

    return {
      id,
      name,
      is_hazardous,
      diameter_km: diameter,
      velocity_kps: velocity,
      miss_dist_km: miss_dist,
    };
  });

  return allNeos;
}

export function getTopNeos(neos) {
  if (!Array.isArray(neos) || neos.length === 0) {
    console.log("No NEO data available.");
    return null;
  }

  const closest = neos.reduce((a, b) => (a.miss_dist_km < b.miss_dist_km ? a : b));
  const biggest = neos.reduce((a, b) => (a.diameter_km > b.diameter_km ? a : b));
  const fastest = neos.reduce((a, b) => (a.velocity_kps > b.velocity_kps ? a : b));

  const formatInfo = (n) => ({
    id: n.id,
    name: n.name,
    diameter_km: n.diameter_km.toFixed(3),
    velocity_kps: n.velocity_kps.toFixed(3),
    miss_distance_km: n.miss_dist_km.toFixed(0),
    hazardous: n.is_hazardous,
  });

  return {
    "closest": formatInfo(closest),
    "biggest": formatInfo(biggest),
    "fastest": formatInfo(fastest),
  };
}

export async function getNeoDetailsById(id, apiKey = "pWBIQYyI27c1H9lcl3AlxW1b8N5v20SBn4KpD0iA") {
  const response = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${apiKey}`);
  const data = await response.json();

  const orbitData = data.orbital_data;
  if (orbitData) {
    const semiMajorAxis = parseFloat(orbitData.semi_major_axis);
    const eccentricity = parseFloat(orbitData.eccentricity);
    const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);

    const approachData = data.close_approach_data?.[0];
    const velocity = approachData
      ? parseFloat(approachData.relative_velocity.kilometers_per_second)
      : 0;

    const angular_speed = velocity / 50000;
    const angle = Math.random() * Math.PI * 2;

    data.orbit = {
      semiMajorAxis,
      semiMinorAxis,
      eccentricity,
      angular_speed,
      angle,
    };
  }

  return data;
}




