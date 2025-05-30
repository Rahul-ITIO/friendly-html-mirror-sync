//The CommonBankAccountResponse class serves as a container for sending information about common bank accounts and admin accounts in a response. It encapsulates two lists—one for common bank accounts and one for admin accounts—and provides methods to access and modify these lists. This DTO ensures that account information is communicated in a structured and consistent manner, facilitating easier data handling and presentation
package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.AdminAccount;
import com.webapp.entity.CommonBankAccount;

public class CommonBankAccountResponse extends CommonApiResponse {

    List<CommonBankAccount> commonBankAccountDetais = new ArrayList<>();
    List<AdminAccount> adminAccountDetais = new ArrayList<>();

    public List<CommonBankAccount> getCommonBankAccountDetais() {
        return commonBankAccountDetais;
    }

    public void setCommonBankAccountDetais(List<CommonBankAccount> commonBankAccountDetais) {
        this.commonBankAccountDetais = commonBankAccountDetais;
    }

    public List<AdminAccount> getAdminAccountDetais() {
        return adminAccountDetais;
    }

    public void setAdminAccountDetais(List<AdminAccount> adminAccountDetais) {
        this.adminAccountDetais = adminAccountDetais;
    }

}
