//The SmtpConfiguration class is responsible for setting up the email sending configuration in the application. It tries to load SMTP configuration from a database and applies it to the JavaMailSender instance. If no configuration is found, it uses default settings and saves these defaults to the database. This ensures that email sending functionality is properly configured either with user-provided settings or default values

package com.webapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import com.webapp.dao.HostingDetailDao;
import com.webapp.entity.HostingDetail;

import jakarta.annotation.PostConstruct;

//import javax.annotation.PostConstruct;
import java.util.Properties;

@Configuration
public class SmtpConfiguration {

    @Autowired
    private HostingDetailDao hostingDetailDao;

    @Autowired
    private JavaMailSender javaMailSender;

    @PostConstruct
    public void init() {
        HostingDetail hostDetail = hostingDetailDao.findFirstById(Long.parseLong("0")); // Assuming SMTP configuration
                                                                                        // is stored with id 1
        if (hostDetail != null) {
            JavaMailSenderImpl mailSender = (JavaMailSenderImpl) javaMailSender;
            mailSender.setHost(hostDetail.getSmtpHost());
            mailSender.setPort(hostDetail.getSmtpPort());
            mailSender.setUsername(hostDetail.getSmtpUsername());
            mailSender.setPassword(hostDetail.getSmtpPassword());

            Properties properties = mailSender.getJavaMailProperties();
            properties.setProperty("mail.smtp.auth", "true");
            properties.setProperty("mail.smtp.starttls.enable", "true");
        } else {
            HostingDetail defaultHostDetail = new HostingDetail();
            defaultHostDetail.setId(Long.parseLong("0"));
            defaultHostDetail.setSmtpHost("smtp.gmail.com");
            defaultHostDetail.setSmtpPort(587); // Assuming default port is 587
            defaultHostDetail.setSmtpUsername("deeptityagi90@gmail.com");
            defaultHostDetail.setSmtpPassword("jnnlbaqmembnjcwu");

            defaultHostDetail.setLogo("logo.png");
            defaultHostDetail.setAddress("");
            defaultHostDetail.setContact("");
            defaultHostDetail.setEmail("");
            defaultHostDetail.setShortName("Online Banking System");
            defaultHostDetail.setLongName("Online Banking System");
            defaultHostDetail.setSidebarColor("#f6f6f6");
            defaultHostDetail.setHeaderColor("#f6f6f6");

            // Save the default values to the database
            hostingDetailDao.save(defaultHostDetail);

            // Use the default values
            JavaMailSenderImpl mailSender = (JavaMailSenderImpl) javaMailSender;
            mailSender.setHost(defaultHostDetail.getSmtpHost());
            mailSender.setPort(defaultHostDetail.getSmtpPort());
            mailSender.setUsername(defaultHostDetail.getSmtpUsername());
            mailSender.setPassword(defaultHostDetail.getSmtpPassword());

            Properties properties = mailSender.getJavaMailProperties();
            properties.setProperty("mail.smtp.auth", "true");
            properties.setProperty("mail.smtp.starttls.enable", "true");
        }
    }

    // Other beans and configurations
}
