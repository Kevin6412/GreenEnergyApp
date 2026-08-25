import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/views/ui/text';
import { useUser } from '@/app/context/UserProfileContext';
import { useEffect, useState,Fragment } from 'react';
import { supabase } from '@/lib/supabase';
import { ProfileController }  from '@/app/controller/profile_controller'
import { styles } from '@/app/styles/profile_style';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile } = useUser();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const badges_emojis = ['🌱','♻️','⚡','🌍','🗻','🗼'] 

  useEffect(() => {

    const fetchUserBadgesFunc = async (curNric) => {
      try { 

        const { success , badges : fetchBadges } =  await ProfileController.GetUserBadges(curNric)

        if (!success ||  fetchBadges == [] ){ 
          throw new Error('Badges can\'t be found');
        }


        let onlyOurBadge = new Array(badges_emojis.length).fill(null)

        fetchBadges.forEach((badge) => {
          const badgeIndex = badge.badge_id - 1; // Our schema starts from 1 
          if (badgeIndex >= 0 && badgeIndex < badges_emojis.length) {
            onlyOurBadge[badgeIndex] = badge
          }
        });

        setBadges(onlyOurBadge);
      }catch (e){
        //Ignore if we can't fetch badges
      }finally {
        setLoading(false)

      }

    }
    if (profile?.nric){
      fetchUserBadgesFunc(profile?.nric)
    }
  }, []);


  if (!profile || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7E57C2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PROFILE</Text>

      <View style={styles.profileCard}>
        <Text style={styles.username}>{profile.username || 'UNKNOWN'}</Text>

        <Text style={styles.town}>{profile.town || 'SINGAPORE'}</Text>

        <Text style={styles.townRank}>TOWN RANK: #{profile.town_ranking || 'N/A'}</Text>

        <Text style={styles.greenScoreLabel}>GREEN SCORE:</Text>

        <Text style={styles.greenScoreValue}>{profile.green_score || 0}</Text>

        <View style={styles.badgesContainer}>
          <Text style={styles.badgesTitle}>BADGES</Text>

          <View style={styles.badgesRow}>
          {
            badges.map( (curBadge, index) => { 
              if (curBadge != null) {
               return ( 
                <Fragment key={index}>
                      <View style={styles.badgeIcon}>
                      <Text style={styles.badgeEmoji}>{ badges_emojis[curBadge.badge_id] }</Text>
                      </View>
                      </Fragment>
                      ) 
              } else {

               return ( 
                <Fragment key={index}>
                      <View style={styles.badgeIcon}>
                      <Text style={styles.badgeEmoji}>{ '🔒'}</Text>
                      </View>
                      </Fragment>)
              }
            
              
            })
          }
          </View>
        </View>
      </View>

      {/* === Back Button === */}
      <Pressable onPress={() => router.push('/menu')} style={styles.backButton}>
        <Text style={styles.backButtonText}>BACK TO HOME</Text>
      </Pressable>
    </View>
  );
}

