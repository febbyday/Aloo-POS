router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies['refresh_token'];
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    // Verify and generate new tokens
    const newTokens = await generateNewTokens(refreshToken);
    
    // Set new cookies
    res.cookie('auth_token', newTokens.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.cookie('refresh_token', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      success: true,
      data: {
        token: newTokens.token,
        refreshToken: newTokens.refreshToken,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
        user: newTokens.user
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});