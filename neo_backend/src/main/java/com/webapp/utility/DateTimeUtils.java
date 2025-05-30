//The DateTimeUtils class provides utility methods for converting epoch time (milliseconds since the Unix epoch) into a human-readable date-time format. It includes methods for formatting the date-time according to a specified pattern
package com.webapp.utility;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class DateTimeUtils {

	public static String getProperDateTimeFormatFromEpochTime(String epochTimeString) {
		
                // Convert the epoch time string to a long value representing milliseconds
		long epochTimeMillis = Long.parseLong(epochTimeString);
		
                 // Create an Instant object from the epoch milliseconds
		Instant instant = Instant.ofEpochMilli(epochTimeMillis);
		
		// Get the system default time zone
		ZoneId zoneId = ZoneId.systemDefault();

		LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, zoneId);

		// Define the desired date format
		String dateFormatPattern = "yyyy-MM-dd HH:mm:ss";

		// Format LocalDateTime to a specific date format
		String formattedDateTime = formatLocalDateTime(localDateTime, dateFormatPattern);

		// Print the formatted date and time
		System.out.println("Formatted DateTime: " + formattedDateTime);

		return formattedDateTime;
	}

	private static String formatLocalDateTime(LocalDateTime dateTime, String dateFormatPattern) {
		// Create a DateTimeFormatter with the specified pattern
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern(dateFormatPattern);

		// Format the LocalDateTime object using the formatter and return the result
		return dateTime.format(formatter);
	}

}
