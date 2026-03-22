import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const calculateSeverity = (score: number) => {
    if (score >= 0 && score <= 7) return 'Mild';
    if (score >= 8 && score <= 19) return 'Moderate';
    if (score >= 20 && score <= 35) return 'Severe';
    throw new Error('Invalid IPSS Score');
};

interface Pathway {
    category: string;
    options: string[];
    note?: string;
}

const getTreatmentRecommendations = (severity: string) => {
    const DISCLAIMER = "DISCLAIMER: This system is for informational purposes only and does not constitute medical advice. Please consult with a certified urologist before making any treatment decisions.";
    
    const recommendations = {
        medical_disclaimer: DISCLAIMER,
        clinical_consultation_required: false,
        recommended_pathways: [] as Pathway[]
    };

    switch (severity) {
        case 'Mild':
            recommendations.recommended_pathways = [
                { category: "Lifestyle Modifications", options: ["Fluid restriction before bed", "Caffeine reduction"] },
                { category: "Observation", options: ["Watchful waiting with annual follow-up"] }
            ];
            break;
        case 'Moderate':
            recommendations.recommended_pathways = [
                { category: "Medical Therapy", options: ["Alpha-blockers", "5-Alpha Reductase Inhibitors"] },
                { category: "Minimally Invasive Surgical Therapies (MIST)", options: ["UroLift", "Rezūm"], note: "Recommended if meds fail or patient prefers." }
            ];
            break;
        case 'Severe':
            recommendations.clinical_consultation_required = true;
            recommendations.recommended_pathways = [
                { category: "Immediate Clinical Action", options: ["Urgent Urology Consultation required."] },
                { category: "Advanced MIST & Surgical Interventions", options: ["TURP", "HoLEP/ThuLEP", "Aquablation Therapy"], note: "Clinical evaluation needed for prostate size." }
            ];
            break;
    }
    return recommendations;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized Caller')

    // Initialize an admin client to bypass the lack of public INSERT policy for profiles
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Ensure the patient has a profile so the database foreign key constraint doesn't fail
    await supabaseAdmin
      .from('profiles')
      .upsert({ id: user.id, first_name: 'Patient', last_name: 'Test' }, { onConflict: 'id' })


    const { answers } = await req.json()
    const totalScore = answers.q1_incomplete_emptying + answers.q2_frequency + answers.q3_intermittency + 
                       answers.q4_urgency + answers.q5_weak_stream + answers.q6_straining + answers.q7_nocturia;
    const severity = calculateSeverity(totalScore);

    const { data: assessment, error: dbErr1 } = await supabaseAdmin
      .from('ipss_assessments')
      .insert({ user_id: user.id, ...answers, total_score: totalScore, severity })
      .select('id').single()

    if (dbErr1) throw dbErr1

    const recs = getTreatmentRecommendations(severity);

    const { error: dbErr2 } = await supabaseAdmin
      .from('treatment_recommendations')
      .insert({
          assessment_id: assessment.id,
          user_id: user.id,
          medical_disclaimer: recs.medical_disclaimer,
          clinical_consultation_required: recs.clinical_consultation_required,
          recommended_pathways: recs.recommended_pathways
      })

    if (dbErr2) throw dbErr2

    return new Response(JSON.stringify({ totalScore, severity, recommendations: recs }), 
                        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })

  } catch (error: unknown) {
    const err = error as { message?: string; details?: string; hint?: string };
    const message = err?.message || "An unknown error occurred";
    const details = err?.details || err?.hint || JSON.stringify(error) || "No extra info";
    return new Response(JSON.stringify({ error: message, details: details }), 
                        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })
  }
})
