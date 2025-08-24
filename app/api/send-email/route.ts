import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { isEmailEnabled } from '@/lib/config'

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

interface AssessmentResult {
  email: string
  recommendations: {
    recommendedLanguage: string
    difficulty: string
    estimatedTime: string
    studyPlan: string
  }
  answers: Array<{
    questionId: string
    answer: string | number
  }>
}

export async function POST(request: NextRequest) {
  // Check if email system is enabled
  if (!isEmailEnabled()) {
    return NextResponse.json(
      { error: 'Email system is disabled' },
      { status: 403 }
    )
  }

  try {
    const body: AssessmentResult = await request.json()
    const { email, recommendations, answers } = body

    if (!email || !recommendations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate email content
    const userEmailHTML = generateUserEmailHTML(body)
    const adminEmailHTML = generateAdminEmailHTML(body)

    // Send email to user
    const userEmail = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@globallanguagetraining.com',
      subject: '🎯 Your Language Learning Assessment Results Are Ready!',
      html: userEmailHTML,
    }

    // Send email to admin
    const adminEmail = {
      to: process.env.ADMIN_EMAIL || 'admin@globallanguagetraining.com',
      from: process.env.FROM_EMAIL || 'noreply@globallanguagetraining.com',
      subject: '🔔 New Assessment Completed - Admin Notification',
      html: adminEmailHTML,
    }

    // Send both emails
    const [userResult, adminResult] = await Promise.all([
      sgMail.send(userEmail),
      sgMail.send(adminEmail)
    ])

    console.log('✅ Emails sent successfully')
    console.log('📧 User email sent to:', email)
    console.log('📧 Admin email sent to:', process.env.ADMIN_EMAIL)

    return NextResponse.json({
      success: true,
      message: 'Emails sent successfully',
      userEmailId: userResult[0]?.headers['x-message-id'],
      adminEmailId: adminResult[0]?.headers['x-message-id']
    })

  } catch (error) {
    console.error('❌ Error sending emails:', error)
    
    // Check if it's a SendGrid error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Invalid SendGrid API key' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}

function generateUserEmailHTML(result: AssessmentResult) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Language Learning Assessment Results</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🎯 Your Assessment Results Are Ready!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Global Language Training Center</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <h2 style="color: #667eea; margin-top: 0;">🌟 Your Personalized Recommendations</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 10px 0; color: #667eea;">🎯 Recommended Language</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${result.recommendations.recommendedLanguage}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #764ba2;">
            <h3 style="margin: 0 0 10px 0; color: #764ba2;">📚 Difficulty Level</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${result.recommendations.difficulty}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f093fb;">
            <h3 style="margin: 0 0 10px 0; color: #f093fb;">⏰ Estimated Time</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${result.recommendations.estimatedTime}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4facfe;">
            <h3 style="margin: 0 0 10px 0; color: #4facfe;">📖 Study Plan</h3>
            <p style="margin: 0; font-size: 14px;">${result.recommendations.studyPlan}</p>
          </div>
        </div>
      </div>
      
      <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #28a745;">
        <h3 style="color: #28a745; margin-top: 0;">🚀 Ready to Start Learning?</h3>
        <p style="margin-bottom: 20px;">Your personalized learning path is ready! Get started today and begin your language learning journey.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Start Learning Now</a>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107;">
        <h3 style="color: #856404; margin-top: 0;">💡 Pro Tips</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Practice daily, even if just for 15 minutes</li>
          <li>Use the language in real conversations</li>
          <li>Watch videos and listen to native speakers</li>
          <li>Join our study groups for motivation</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          Questions? Contact us at <a href="mailto:support@globallanguagetraining.com" style="color: #667eea;">support@globallanguagetraining.com</a>
        </p>
        <p style="color: #999; font-size: 12px;">
          © 2024 Global Language Training Center. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `
}

function generateAdminEmailHTML(result: AssessmentResult) {
  const answersText = result.answers
    .map(answer => `${answer.questionId}: ${answer.answer}`)
    .join('\n')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Assessment Completed - Admin Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc3545; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🔔 New Assessment Completed</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Global Language Training Center</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <h2 style="color: #dc3545; margin-top: 0;">📊 Assessment Summary</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">👤 User Information</h3>
          <p><strong>Email:</strong> ${result.email}</p>
          <p><strong>Assessment Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">🎯 Recommendations</h3>
          <p><strong>Language:</strong> ${result.recommendations.recommendedLanguage}</p>
          <p><strong>Level:</strong> ${result.recommendations.difficulty}</p>
          <p><strong>Time:</strong> ${result.recommendations.estimatedTime}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #333;">📝 All Answers</h3>
          <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px;">${answersText}</pre>
        </div>
      </div>
      
      <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; border-left: 4px solid #17a2b8;">
        <h3 style="color: #0c5460; margin-top: 0;">📈 Next Steps</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Review the assessment results</li>
          <li>Consider reaching out to the user</li>
          <li>Update user segmentation if needed</li>
          <li>Monitor their progress</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">
          Audit Logs: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/audit" style="color: #17a2b8;">View Logs</a>
        </p>
        <p style="color: #999; font-size: 12px;">
          © 2024 Global Language Training Center. Admin Notification.
        </p>
      </div>
    </body>
    </html>
  `
}
