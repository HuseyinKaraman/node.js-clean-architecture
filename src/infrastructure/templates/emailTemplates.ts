export const baseTemplate = (content: string, headerTitle: string, headerColor: string = '#1a82e2') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${headerTitle} - Filayo</title>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    body {
        font-family: 'Poppins', Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f4f7fa;
    }
    .container {
        max-width: 600px;
        margin: 40px auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    .header {
        background: ${headerColor};
        padding: 40px 20px;
        text-align: center;
        color: white;
    }
    .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
    }
    .content {
        padding: 32px;
    }
    .message {
        padding: 24px;
        font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 24px;
    }
    .verification-code {
        text-align: center;
        font-size: 32px;
        letter-spacing: 4px;
        font-weight: 600;
        color: ${headerColor};
        margin: 24px 0;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
    }
    a.action-button {
        display: block;
        width: 200px;
        margin: 32px auto;
        padding: 16px 24px;
        background: ${headerColor};
        color: #ffffff !important;
        text-decoration: none !important;
        text-align: center;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
    }
    a.action-button:link,
    a.action-button:visited,
    a.action-button:hover,
    a.action-button:active {
        color: #ffffff !important;
        text-decoration: none !important;
    }
    .footer {
        background: #f8f9fa;
        padding: 24px;
        text-align: center;
        font-size: 14px;
        color: #6c757d;
        border-top: 1px solid #e9ecef;
    }
    @media (max-width: 600px) {
        .container {
        margin: 20px;
        width: auto;
        }
    }
    </style>
</head>
<body>
    <div class="container">
    <div class="header">
        <h1>${headerTitle}</h1>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <p>Bu email Filayo sisteminden gönderilmiştir.</p>
        <p>© 2025 Filayo. Tüm hakları saklıdır.</p>
    </div>
    </div>
</body>
</html>
`;

export const emailTemplates = {
    verificationCodeTemplate: (verificationCode: string) => {
        const content = `
            <div class="message">
                <p>
                    Email adresinizi doğrulamak için aşağıdaki doğrulama kodunu kullanın. Bu kod 10 dakika süreyle geçerlidir.
                </p>
            </div>
            
            <div class="verification-code">
                ${verificationCode}
            </div>
            
            <div class="message">
                <p style="margin: 0">
                    Bu kodu uygulamadaki doğrulama ekranına girerek hesabınızı doğrulayabilirsiniz.
                </p>
            </div>
        `;
        return baseTemplate(content, "Filayo'ya Hoş Geldiniz!", '#1a82e2');
    },

    passwordResetTemplate: (frontendUrl: string, resetCode: string) => {
        const content = `
            <div class="message">
                <p>
                    Şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak veya linki tarayıcınıza kopyalayarak şifrenizi sıfırlayabilirsiniz.
                </p>
            </div>

            <a href="${frontendUrl}/auth/reset-password?code=${resetCode}" class="action-button">
                Şifremi Sıfırla
            </a>

            <div class="message" style="text-align: center; padding: 0 24px 24px 24px;">
                <p style="color: #666; font-size: 14px;">
                    Eğer buton çalışmazsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırabilirsiniz:
                    <br/>
                    <span style="color: #2e7d32; word-break: break-all;">${frontendUrl}/auth/reset-password?code=${resetCode}</span>
                </p>
            </div>

            <div class="message">
                <p>
                    Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili dikkate almayın.
                </p>
                <p>
                    Herhangi bir sorunuz olması durumunda destek ekibimizle iletişime geçebilirsiniz.
                </p>
            </div>
        `;
        return baseTemplate(content, "Filayo - Şifre Sıfırlama", '#2e7d32');
    },

    passwordChangedTemplate: (userName: string) => {
        const content = `
            <div class="message">
                <p>Sayın ${userName},</p>
                <p>
                    Filayo hesabınızın şifresi başarıyla değiştirildi. Bu değişikliği siz yapmadıysanız, lütfen hemen bizimle iletişime geçin.
                </p>
            </div>

            <div class="message" style="background-color: #f5f5f5; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 0; font-weight: 500; color: #333;">
                    Güvenlik Tavsiyeleri:
                </p>
                <ul style="margin-top: 8px; padding-left: 20px;">
                    <li>Şifrenizi hiç kimseyle paylaşmayın</li>
                    <li>Şifrenizi düzenli olarak değiştirin</li>
                    <li>Farklı hesaplar için farklı şifreler kullanın</li>
                    <li>İki faktörlü doğrulama kullanmayı düşünün</li>
                </ul>
            </div>

            <div class="message">
                <p>
                    Eğer hesabınızla ilgili herhangi bir sorunuz varsa veya şüpheli bir aktivite fark ederseniz, 
                    lütfen destek ekibimize ulaşın.
                </p>
            </div>
        `;
        return baseTemplate(content, "Filayo - Şifre Değişikliği Onayı", '#4a6da7');
    },

    deleteAccountCodeTemplate: (deleteAccountCode: string) => {
        const content = `
            <div class="message">
                <p>
                    Hesabınızı silmek için aşağıdaki doğrulama kodunu kullanın. Bu kod 10 dakika süreyle geçerlidir.
                </p>
            </div>
            
            <div class="verification-code">
                ${deleteAccountCode}
            </div>
            
            <div class="message">
                <p style="margin: 0">
                    Bu kodu uygulamadaki doğrulama ekranına girerek hesabınızı silebilirsiniz.
                </p>
            </div>
        `;
        return baseTemplate(content, "Filayo - Hesabınızı Sil", '#d32f2f');
    },

    // diğer templateler...
};