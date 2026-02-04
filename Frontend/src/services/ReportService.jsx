const API_URL = 'https://localhost:7140/api/client'; 

export const ReportService = {
    // Lấy lịch sử báo cáo của user
    getReportsByUserId: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/Report/user/${userId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching reports:", error);
            throw error;
        }
    },

    // Gửi báo cáo mới
    createReport: async (reportData) => {
        try {
            const response = await fetch(`${API_URL}/Report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error creating report:", error);
            throw error;
        }
    }
};