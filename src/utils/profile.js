export const normalizeProfile = (profile = {}, fallback = {}) => {
  const avatar =
    profile.userAvatar ??
    profile.avatar ??
    fallback.userAvatar ??
    ''

  const nickname =
    profile.userName ??
    profile.nickname ??
    fallback.userName ??
    fallback.nickname ??
    fallback.userAccount ??
    'U'

  return {
    avatar,
    nickname,
    gender: profile.gender ?? '保密',
    grade: profile.grade ?? '',
    major: profile.major ?? '',
    school: profile.school ?? '',
    bio: profile.userProfile ?? profile.bio ?? ''
  }
}



