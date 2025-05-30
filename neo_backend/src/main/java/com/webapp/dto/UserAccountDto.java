//the UserAccountDto class is designed to encapsulate the response data for API requests involving multiple user accounts. It extends CommonApiResponse to maintain a consistent response format and includes a list of UserAccounts to hold the account details being returned. This DTO is typically used in scenarios where a set of user accounts needs to be retrieved and provided to the client, such as in user account management or querying operations

package com.webapp.dto;

import java.util.ArrayList;
import java.util.List;

import com.webapp.entity.UserAccounts;

public class UserAccountDto extends CommonApiResponse {

    private List<UserAccounts> Accounts = new ArrayList<>();

    public List<UserAccounts> getAccounts() {
        return Accounts;
    }

    public void setAccounts(List<UserAccounts> accounts) {
        Accounts = accounts;
    }

}
