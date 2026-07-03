module.exports = async function handler(req, res) {
  try {
    const { code } = req.query
    if (!code) return res.status(400).send('No code')

    const channelId = '2009657612'
    const channelSecret = process.env.LINE_CHANNEL_SECRET
    const appUrl = process.env.APP_URL || 'https://tesquiz-app.vercel.app'

    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: appUrl + '/api/line-callback',
        client_id: channelId,
        client_secret: channelSecret
      })
    })
    const tokenData = await tokenRes.json()
    console.log('tokenData:', JSON.stringify(tokenData))

    if (!tokenData.access_token) {
      return res.status(500).send('Token error: ' + JSON.stringify(tokenData))
    }

    const profileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const profile = await profileRes.json()
    console.log('profile:', JSON.stringify(profile))

    if (!profile.userId) {
      return res.status(500).send('Profile error: ' + JSON.stringify(profile))
    }

    const cookies = [
      `line_uid=${profile.userId}; Path=/; Max-Age=31536000`,
      `line_name=${encodeURIComponent(profile.displayName)}; Path=/; Max-Age=31536000`
    ]
    res.setHeader('Set-Cookie', cookies)
    res.redirect('/')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error: ' + err.message)
  }
}
