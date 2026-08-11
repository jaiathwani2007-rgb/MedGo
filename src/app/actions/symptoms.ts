'use server'

import { createClient } from '@/utils/supabase/server'
import { type Medicine } from './catalog'

export async function analyzeSymptoms(symptomText: string): Promise<{
  redFlag: boolean,
  matchedKeyword?: string,
  suggestedMedicines?: Medicine[]
}> {
  const supabase = await createClient()
  
  // 1. Fetch all red flag keywords
  const { data: keywordsData } = await supabase.from('red_flag_keywords').select('keyword')
  
  const textLower = symptomText.toLowerCase()
  let matchedKeyword = null
  
  if (keywordsData) {
    for (const row of keywordsData) {
      if (textLower.includes(row.keyword.toLowerCase())) {
        matchedKeyword = row.keyword
        break
      }
    }
  }

  // 2. If red flag matched, abort and return warning
  if (matchedKeyword) {
    return { redFlag: true, matchedKeyword }
  }

  // 3. Safe symptoms -> Suggest OTC medicines
  // Split terms for fuzzy matching (ignore small words)
  const terms = textLower.split(/[\s,]+/).filter(t => t.length > 3)
  
  let dbQuery = supabase
    .from('medicines')
    .select('*')
    .eq('is_otc_whitelisted', true)
    .limit(6)
  
  if (terms.length > 0) {
    // Basic OR condition for multiple terms
    const likeConditions = terms.map(t => `name.ilike.%${t}%,generic_name.ilike.%${t}%`).join(',')
    dbQuery = dbQuery.or(likeConditions)
  }

  const { data: meds } = await dbQuery
  
  return { redFlag: false, suggestedMedicines: meds || [] }
}
