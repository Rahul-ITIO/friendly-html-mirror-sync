//The HostingDetailResponse class serves as a container for sending hosting-related information along with additional resources, such as images, in response to a request. It helps in structuring the response data in a way that separates the core hosting details from additional media, allowing for a more flexible and comprehensive response format. This class is particularly useful in scenarios where hosting information needs to be presented with visual assets or other supplementary files
package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.HostingDetail;

import org.springframework.core.io.Resource;

public class HostingDetailResponse extends CommonApiResponse {
    private HostingDetail hostingDetail = new HostingDetail();
    private Resource imageBytes;

    public HostingDetail getHostingDetail() {
        return hostingDetail;
    }

    public void setHostingDetail(HostingDetail hostingDetail) {
        this.hostingDetail = hostingDetail;
    }

    public Resource getImageBytes() {
        return imageBytes;
    }

    public void setImageBytes(Resource imageBytes) {
        this.imageBytes = imageBytes;
    }

}
