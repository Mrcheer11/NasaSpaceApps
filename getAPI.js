export async function getAllNeosData(date, apiKey = "pWBIQYyI27c1H9lcl3AlxW1b8N5v20SBn4KpD0iA") {

  const res = await fetch(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${apiKey}`
  );
  const data = await res.json();

  const neos = Object.values(data.near_earth_objects).flat();

  const browseRes = await fetch(
    `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${apiKey}`
  );
  const browseData = await browseRes.json();

  const orbitLookup = {};
  for (const obj of browseData.near_earth_objects) {
    if (obj.orbital_data) {
      orbitLookup[obj.id] = obj.orbital_data;
    }
  }

  const allNeos = neos.map((obj) => {
    const name = obj.name;
    const is_hazardous = obj.is_potentially_hazardous_asteroid;
    const diameter =
      (obj.estimated_diameter.kilometers.estimated_diameter_min +
        obj.estimated_diameter.kilometers.estimated_diameter_max) /
      2;

    const approach = obj.close_approach_data[0];
    const velocity = parseFloat(approach.relative_velocity.kilometers_per_second);
    const miss_dist = parseFloat(approach.miss_distance.kilometers);

    // Get semi-major axis and eccentricity from browse data if available
    const orbitData = orbitLookup[obj.id];
    const semiMajorAxis = orbitData ? parseFloat(orbitData.semi_major_axis) : miss_dist / 100000;
    const eccentricity = orbitData ? parseFloat(orbitData.eccentricity) : 0.2;
    const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);

    const angular_speed = velocity / 50000;
    const angle = Math.random() * Math.PI * 2;

    return {
      name,
      is_hazardous,
      diameter_km: diameter,
      velocity_kps: velocity,
      miss_dist_km: miss_dist,
      eccentricity,
      orbit: {
        semiMajorAxis,
        semiMinorAxis,
        angular_speed,
        angle,
      },
    };
  });

  return allNeos;
}

export function getTopNeos(neos) {
  if (!Array.isArray(neos) || neos.length === 0) {
    console.log("No NEO data available.");
    return null;
  }

  // Find closest to Earth (smallest miss distance)
  const closest = neos.reduce((semiMajorAxis, semiMinorAxis) => (semiMajorAxis.miss_dist_km < semiMinorAxis.miss_dist_km ? semiMajorAxis : semiMinorAxis));

  // Find biggest by diameter
  const biggest = neos.reduce((semiMajorAxis, semiMinorAxis) => (semiMajorAxis.diameter_km > semiMinorAxis.diameter_km ? semiMajorAxis : semiMinorAxis));

  // Find fastest by velocity
  const fastest = neos.reduce((semiMajorAxis, semiMinorAxis) => (semiMajorAxis.velocity_kps > semiMinorAxis.velocity_kps ? semiMajorAxis : semiMinorAxis));

  const formatInfo = (n) => ({
    name: n.name,
    diameter_km: n.diameter_km.toFixed(3),
    velocity_kps: n.velocity_kps.toFixed(3),
    miss_distance_km: n.miss_dist_km.toFixed(0),
    hazardous: n.is_hazardous,
    orbit: n.orbit,
  });

  return {
    closest: formatInfo(closest),
    biggest: formatInfo(biggest),
    fastest: formatInfo(fastest),
  };
}

document.getElementById("button all").onclick = function() {
            var option = document.getElementById("UserOption").value;
            if (option == "Fastest") {
                fastest;
                document.getElementById("button all").style.backgroundColor = "red";
            }
            else if (option == "Closest") {
                closest;
            }
            else if (option == "Biggest") {
                biggest;
                
                
            }
            // need to make sure that the date input is translated to python correctly.(for now its semiMajorAxis string yyyy-mm-dd)
            // the functions should stack on each other so that the output of one function is the input of the next
        };


  
