import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})
function sendVerificationEmail(to:string, code:string) {
    const mailOptions = {
        from: '"Super Cloud" <3118654731@qq.com>',
        to,
        subject: '邮箱验证码',
        html: `<p>您的验证码是：<strong>${code}</strong></p>`
    }
    return transporter.sendMail(mailOptions)
}
export { sendVerificationEmail }