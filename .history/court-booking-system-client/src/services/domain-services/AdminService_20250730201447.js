import hotPocketService from '../common-services/HotPocketService';

class AdminService {
  // Remove user by email or ID
  async removeUser(userIdentifier) {
    if (!userIdentifier) throw new Error("User identifier (ID or Email) is required.");
    
    return await hotPocketService.getServerInputResponse({
      type: 'Admin',
      subType: 'removeUser',
      data: { userIdentifier }
    });
  }

  // Remove court by court ID
  async removeCourt(courtId) {
    if (!courtId) throw new Error("Court ID is required.");
    
    return await hotPocketService.getServerInputResponse({
      type: 'Admin',
      subType: 'removeCourt',
      data: { courtId }
    });
  }

  // Remove pending court by ID
  async removePendingCourt(pendingCourtId) {
    if (!pendingCourtId) throw new Error("Pending court ID is required.");
    
    return await hotPocketService.getServerInputResponse({
      type: 'Admin',
      subType: 'removePendingCourt',
      data: { pendingCourtId }
    });
  }

  // Get all users
  async getAllUsers() {
    return await hotPocketService.getServerReadReqResponse({
      type: 'Admin',
      subType: 'getAllUsers'
    });
  }

  // Get all courts
  async getAllCourts() {
    return await hotPocketService.getServerReadReqResponse({
      type: 'Admin',
      subType: 'getAllCourts'
    });
  }
}

const adminServiceInstance = new AdminService();
export default adminServiceInstance;
