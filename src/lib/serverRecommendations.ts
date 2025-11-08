import { ServerRecommendation } from './types';

/**
 * Generate server recommendations based on storage requirements
 */
export function generateServerRecommendations(
  totalUsableTB: number,
  cameraCount: number,
  writeThroughputMbps?: number
): ServerRecommendation {
  // Calculate required write throughput if not provided
  // Assume ~2 Mbps per camera average
  const estimatedThroughput = writeThroughputMbps || cameraCount * 2;

  // Determine number of servers based on total TB
  let numberOfServers: number;
  if (totalUsableTB >= 250) {
    numberOfServers = 3; // 3-node cluster for large deployments
  } else if (totalUsableTB >= 150) {
    numberOfServers = 2; // 2-node cluster for medium-large
  } else {
    numberOfServers = 1; // Single server for smaller deployments
  }

  // Calculate drives per server based on usable space and RAID type
  // Assume RAID-6 for redundancy (50% overhead)
  const rawCapacityNeeded = totalUsableTB * 1.5; // Account for RAID overhead
  const capacityPerServer = rawCapacityNeeded / numberOfServers;
  
  // Use 18-22 TB drives for enterprise deployments
  const driveCapacity = 18; // Default to 18 TB drives
  let drivesPerServer = Math.ceil(capacityPerServer / driveCapacity);
  
  // Ensure minimum of 4 drives per server for RAID
  if (drivesPerServer < 4) {
    drivesPerServer = 4;
  }
  
  // Adjust for RAID-6 (minimum 4 drives, ideally 6+)
  if (drivesPerServer < 6 && totalUsableTB > 100) {
    drivesPerServer = 6;
  }

  // Determine drive type based on capacity needs
  let driveType: string;
  if (capacityPerServer > 300) {
    driveType = 'Enterprise 20-22 TB'; // Large capacity needs
  } else if (capacityPerServer > 150) {
    driveType = 'Enterprise 18 TB'; // Medium-large
  } else {
    driveType = 'Enterprise 16 TB'; // Standard
  }

  // Network recommendation based on throughput
  let network: string;
  if (estimatedThroughput > 1000 || cameraCount > 200) {
    network = 'Dual 25 GbE links'; // High throughput
  } else if (estimatedThroughput > 500 || cameraCount > 100) {
    network = 'Dual 10 GbE links'; // Medium-high
  } else {
    network = 'Dual 10 GbE links'; // Standard
  }

  // CPU recommendation
  const cpu = numberOfServers > 1 
    ? 'Intel Xeon Silver 4410Y (12 Core) or AMD EPYC 7313+'
    : 'Intel Xeon Silver 4410Y (12 Core) or AMD EPYC 7313+';

  // Memory recommendation
  const memory = numberOfServers > 1
    ? '128 GB RAM per server'
    : '96-128 GB RAM per server';

  // OS/Filesystem recommendation
  const osFilesystem = numberOfServers > 1
    ? 'Ubuntu Server 22.04 LTS with Ceph (distributed)'
    : 'Ubuntu Server 22.04 LTS with OpenZFS';

  // Generate rationale
  const rationale: string[] = [];
  rationale.push(`Total usable storage requirement: ${totalUsableTB.toFixed(1)} TB`);
  rationale.push(`Camera count: ${cameraCount} cameras`);
  if (writeThroughputMbps) {
    rationale.push(`Write throughput: ${estimatedThroughput.toFixed(1)} Mbps`);
  }
  rationale.push(`${numberOfServers} ${numberOfServers > 1 ? 'servers' : 'server'} recommended for ${totalUsableTB >= 250 ? 'large-scale' : totalUsableTB >= 150 ? 'medium-scale' : 'small-scale'} deployment`);
  rationale.push(`${drivesPerServer} drives per server using ${driveType} drives`);
  rationale.push(`${network} recommended for ${estimatedThroughput > 1000 ? 'high' : estimatedThroughput > 500 ? 'medium-high' : 'standard'} throughput requirements`);

  return {
    numberOfServers,
    drivesPerServer,
    driveType,
    network,
    cpu,
    memory,
    osFilesystem,
    rationale
  };
}

