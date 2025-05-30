package com.webapp.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.webapp.entity.BlackList;
public class BlacklistValidationService {

    public static boolean isBlacklisted(List<BlackList> blackList, Map<String, Object> request, StringBuilder blacklistPrintMessage) {
        boolean isAllowed = true;

        for (BlackList entry : blackList) {
            String blacklistID = String.valueOf(entry.getId());
            String clientId = String.valueOf(entry.getClientId());
            String type = entry.getBlacklistType();
            String value = entry.getBlacklistValue();
            String condition = entry.getCondition();
            String remark = entry.getRemarks();

            if (type == null || value == null || condition == null) continue;

            type = type.trim();
            value = value.trim();
            condition = condition.trim();
            remark = remark != null ? remark.trim() : "";

            if (!request.containsKey(type) || request.get(type) == null) continue;
            String requestValue = request.get(type).toString().trim();

            String readable = getConditionReadable(condition);
            String idSep = clientId.equalsIgnoreCase("-10") ? "_" : clientId.startsWith("-") ? "-" : "=";

            String message = blacklistID + idSep + "Blacklisted: " + type + " " + readable + " " + value + " via " + remark;

            if (value.contains(",")) {
                List<String> valueList = Arrays.stream(value.split(",")).map(String::trim).toList();

                if (matchListCondition(condition, requestValue, valueList)) {
                    blacklistPrintMessage.append(message);
                    return false;
                }
            } else {
                if (matchSingleCondition(condition, requestValue, value)) {
                    blacklistPrintMessage.append(message);
                    return false;
                }
            }
        }

        return isAllowed;
    }

    private static boolean matchListCondition(String condition, String requestValue, List<String> values) {
        try {
            switch (condition.toUpperCase()) {
                case "IN": return values.contains(requestValue);
                case "NOT_IN": return !values.contains(requestValue);
                case "LESS_THAN":
                case "GREATER_THAN":
                case "LESS_THAN_OR_EQUAL_TO":
                case "GREATER_THAN_OR_EQUAL_TO":
                    double req = Double.parseDouble(requestValue);
                    for (String val : values) {
                        double cmp = Double.parseDouble(val);
                        if (compareNumbers(condition, req, cmp)) return true;
                    }
                    break;
                case "BETWEEN":
                case "NOT_BETWEEN":
                    double rv = Double.parseDouble(requestValue);
                    for (String range : values) {
                        String[] parts = range.split("-");
                        if (parts.length == 2) {
                            double low = Double.parseDouble(parts[0].trim());
                            double high = Double.parseDouble(parts[1].trim());
                            if (condition.equals("BETWEEN") && rv >= low && rv <= high) return true;
                            if (condition.equals("NOT_BETWEEN") && (rv < low || rv > high)) return true;
                        }
                    }
                    break;
                default:
                    for (String val : values) {
                        if (matchStringCondition(condition, requestValue, val)) return true;
                    }
            }
        } catch (Exception e) {
            System.err.println("List condition error: " + e.getMessage());
        }
        return false;
    }

    private static boolean matchSingleCondition(String condition, String requestValue, String compareValue) {
        try {
            switch (condition.toUpperCase()) {
                case "IN": return requestValue.equals(compareValue);
                case "NOT_IN": return !requestValue.equals(compareValue);
                case "LESS_THAN":
                case "GREATER_THAN":
                case "LESS_THAN_OR_EQUAL_TO":
                case "GREATER_THAN_OR_EQUAL_TO":
                    return compareNumbers(condition, Double.parseDouble(requestValue), Double.parseDouble(compareValue));
                case "BETWEEN":
                case "NOT_BETWEEN":
                    String[] parts = compareValue.split("-");
                    if (parts.length == 2) {
                        double req = Double.parseDouble(requestValue);
                        double low = Double.parseDouble(parts[0].trim());
                        double high = Double.parseDouble(parts[1].trim());
                        return (condition.equals("BETWEEN") && req >= low && req <= high) ||
                               (condition.equals("NOT_BETWEEN") && (req < low || req > high));
                    }
                    break;
                case "IS_EMPTY": return requestValue.isEmpty();
                case "IS_NOT_EMPTY": return !requestValue.isEmpty();
                case "IS_NULL": return requestValue == null;
                case "IS_NOT_NULL": return requestValue != null;
                case "EXISTS": return true;
                case "NOT_EXISTS": return false;
                default: return matchStringCondition(condition, requestValue, compareValue);
            }
        } catch (Exception e) {
            System.err.println("Single condition error: " + e.getMessage());
        }
        return false;
    }

    private static boolean compareNumbers(String condition, double req, double cmp) {
        return switch (condition.toUpperCase()) {
            case "LESS_THAN" -> req < cmp;
            case "GREATER_THAN" -> req > cmp;
            case "LESS_THAN_OR_EQUAL_TO" -> req <= cmp;
            case "GREATER_THAN_OR_EQUAL_TO" -> req >= cmp;
            default -> false;
        };
    }

    private static boolean matchStringCondition(String condition, String request, String compare) {
        return switch (condition.toUpperCase()) {
            case "EQUAL_TO" -> request.equals(compare);
            case "NOT_EQUAL_TO" -> !request.equals(compare);
            case "CONTAINS" -> request.contains(compare);
            case "NOT_CONTAINS" -> !request.contains(compare);
            case "STARTS_WITH" -> request.startsWith(compare);
            case "NOT_STARTS_WITH" -> !request.startsWith(compare);
            case "ENDS_WITH" -> request.endsWith(compare);
            case "NOT_ENDS_WITH" -> !request.endsWith(compare);
            default -> false;
        };
    }

    private static String getConditionReadable(String condition) {
        return switch (condition.toUpperCase()) {
            case "IN" -> "is in";
            case "NOT_IN" -> "is not in";
            case "EQUALS", "EQUAL_TO" -> "equals to";
            case "NOT_EQUAL_TO" -> "not equal to";
            case "LESS_THAN" -> "less than";
            case "GREATER_THAN" -> "greater than";
            case "LESS_THAN_OR_EQUAL_TO" -> "less than or equal to";
            case "GREATER_THAN_OR_EQUAL_TO" -> "greater than or equal to";
            case "CONTAINS" -> "contains";
            case "NOT_CONTAINS" -> "does not contain";
            case "STARTS_WITH" -> "starts with";
            case "NOT_STARTS_WITH" -> "does not start with";
            case "ENDS_WITH" -> "ends with";
            case "NOT_ENDS_WITH" -> "does not end with";
            case "BETWEEN" -> "between";
            case "NOT_BETWEEN" -> "not between";
            case "EXISTS" -> "exists";
            case "NOT_EXISTS" -> "does not exist";
            case "IS_NULL" -> "is null";
            case "IS_NOT_NULL" -> "is not null";
            case "IS_EMPTY" -> "is empty";
            case "IS_NOT_EMPTY" -> "is not empty";
            case "EXISTS_IN", "EXISTS_IN_LIST", "EXISTS_IN_ARRAY" -> "exists in list";
            case "NOT_EXISTS_IN", "NOT_EXISTS_IN_LIST", "NOT_EXISTS_IN_ARRAY" -> "does not exist in list";
            default -> condition;
        };
    }
}
