import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/app/api/_lib/supabase';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST /api/admin/seed-job-roles — Seed 150 job roles
export async function POST(req: NextRequest) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  }

  try {
    // 150 job roles with personality profiles (Big Five, MBTI, DISC)
    const jobRolesData = [
      // Tech & Engineering (1-30)
      { role_number: 1, role_name: 'Software Engineer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 3, big5_c: 4, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 2, role_name: 'Data Scientist', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 4, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 3, role_name: 'Product Manager', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 4, role_name: 'UX Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 5, role_name: 'DevOps Engineer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 6, role_name: 'Frontend Developer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 7, role_name: 'Backend Developer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 3, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 8, role_name: 'Mobile Developer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 9, role_name: 'Machine Learning Engineer', mbti_ei: 2, mbti_sn: 5, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 5, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 10, role_name: 'QA Engineer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 11, role_name: 'Systems Architect', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 4, big5_c: 5, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 12, role_name: 'Cloud Engineer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 4, big5_o: 3, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 13, role_name: 'Cybersecurity Analyst', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 4, big5_o: 3, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 3, job_collar: 'white' },
      { role_number: 14, role_name: 'Game Developer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 15, role_name: 'Blockchain Developer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 16, role_name: 'IT Project Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 3, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 5, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 17, role_name: 'Technical Writer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 2, disc_i: 2, disc_s: 4, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 18, role_name: 'Site Reliability Engineer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 19, role_name: 'Database Administrator', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 5, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 20, role_name: 'Embedded Systems Engineer', mbti_ei: 2, mbti_sn: 5, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 3, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 21, role_name: 'Network Engineer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 4, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 22, role_name: 'Solutions Architect', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 23, role_name: 'Release Manager', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 5, disc_d: 4, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 24, role_name: 'Scrum Master', mbti_ei: 4, mbti_sn: 3, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 4, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 4, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 25, role_name: 'Technical Lead', mbti_ei: 4, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 26, role_name: 'AI Research Scientist', mbti_ei: 2, mbti_sn: 5, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 2, disc_c: 5, big5_o: 5, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 27, role_name: 'Computer Vision Engineer', mbti_ei: 2, mbti_sn: 5, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 4, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 28, role_name: 'NLP Engineer', mbti_ei: 2, mbti_sn: 5, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 5, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 29, role_name: 'Platform Engineer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 30, role_name: 'Security Engineer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 4, big5_o: 3, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 3, job_collar: 'white' },
      // Healthcare & Medical (31-50)
      { role_number: 31, role_name: 'Physician', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 3, big5_a: 5, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 32, role_name: 'Surgeon', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 5, disc_i: 2, disc_s: 3, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 33, role_name: 'Registered Nurse', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 4, disc_s: 5, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 4, big5_a: 5, big5_n: 3, job_collar: 'healthcare' },
      { role_number: 34, role_name: 'Pharmacist', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 5, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 35, role_name: 'Physical Therapist', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 5, disc_c: 3, big5_o: 3, big5_c: 3, big5_e: 4, big5_a: 5, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 36, role_name: 'Dentist', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 37, role_name: 'Clinical Psychologist', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 3, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 3, big5_a: 5, big5_n: 4, job_collar: 'healthcare' },
      { role_number: 38, role_name: 'Healthcare Administrator', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 4, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 39, role_name: 'Medical Laboratory Scientist', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 5, big5_o: 3, big5_c: 4, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 40, role_name: 'Occupational Therapist', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 5, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 4, big5_a: 5, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 41, role_name: 'Veterinarian', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 4, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 5, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 42, role_name: 'Speech-Language Pathologist', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 4, big5_a: 5, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 43, role_name: 'Radiologic Technologist', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 44, role_name: 'Dental Hygienist', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 5, disc_c: 3, big5_o: 3, big5_c: 3, big5_e: 4, big5_a: 4, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 45, role_name: 'Genetic Counselor', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 4, big5_c: 3, big5_e: 3, big5_a: 5, big5_n: 3, job_collar: 'healthcare' },
      { role_number: 46, role_name: 'Anesthesiologist', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 47, role_name: 'Cardiologist', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 48, role_name: 'Pediatrician', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 4, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 5, big5_n: 2, job_collar: 'healthcare' },
      { role_number: 49, role_name: 'Psychiatrist', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 3, big5_a: 5, big5_n: 4, job_collar: 'healthcare' },
      { role_number: 50, role_name: 'Emergency Medicine Physician', mbti_ei: 4, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 5, disc_i: 3, disc_s: 3, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 4, big5_a: 3, big5_n: 3, job_collar: 'healthcare' },
      // Creative & Arts (51-70)
      { role_number: 51, role_name: 'Graphic Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 52, role_name: 'UX Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'arts' },
      { role_number: 53, role_name: 'Illustrator', mbti_ei: 2, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 3, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 2, big5_a: 3, big5_n: 3, job_collar: 'arts' },
      { role_number: 54, role_name: 'Art Director', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 4, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 55, role_name: 'Photographer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 4, disc_s: 3, disc_c: 2, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 56, role_name: 'Video Editor', mbti_ei: 2, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 2, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 3, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 57, role_name: 'Motion Graphics Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 2, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 58, role_name: 'Creative Director', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 5, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 4, big5_e: 5, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 59, role_name: 'Interior Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 4, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'arts' },
      { role_number: 60, role_name: 'Fashion Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 3, disc_c: 2, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 61, role_name: 'Product Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 62, role_name: 'Brand Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 63, role_name: 'UI Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 4, disc_s: 3, disc_c: 4, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 64, role_name: 'Web Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 65, role_name: 'Animator', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 2, disc_i: 3, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 66, role_name: '3D Artist', mbti_ei: 2, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 2, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 3, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 67, role_name: 'Visual Effects Artist', mbti_ei: 2, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 3, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'arts' },
      { role_number: 68, role_name: 'Game Artist', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 69, role_name: 'Packaging Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'arts' },
      { role_number: 70, role_name: 'UX Researcher', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 2, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'arts' },
      // Business & Finance (71-90)
      { role_number: 71, role_name: 'Investment Banker', mbti_ei: 4, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 5, disc_i: 4, disc_s: 2, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 4, big5_a: 2, big5_n: 3, job_collar: 'white' },
      { role_number: 72, role_name: 'Management Consultant', mbti_ei: 4, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 4, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 73, role_name: 'Financial Analyst', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 5, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 74, role_name: 'Accountant', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 5, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 5, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 75, role_name: 'Marketing Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 5, disc_s: 3, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 5, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 76, role_name: 'Sales Manager', mbti_ei: 5, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 5, disc_i: 5, disc_s: 3, disc_c: 2, big5_o: 3, big5_c: 4, big5_e: 5, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 77, role_name: 'Human Resources Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 4, disc_d: 3, disc_i: 4, disc_s: 5, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 4, big5_a: 5, big5_n: 2, job_collar: 'white' },
      { role_number: 78, role_name: 'Operations Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 4, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 79, role_name: 'CEO', mbti_ei: 5, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 5, disc_i: 4, disc_s: 2, disc_c: 4, big5_o: 5, big5_c: 5, big5_e: 5, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 80, role_name: 'Entrepreneur', mbti_ei: 5, mbti_sn: 4, mbti_tf: 4, mbti_jp: 3, disc_d: 5, disc_i: 4, disc_s: 2, disc_c: 3, big5_o: 5, big5_c: 4, big5_e: 5, big5_a: 2, big5_n: 3, job_collar: 'white' },
      { role_number: 81, role_name: 'Product Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 82, role_name: 'Project Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 5, disc_d: 4, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 83, role_name: 'Supply Chain Manager', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 4, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 84, role_name: 'Risk Manager', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 2, big5_n: 3, job_collar: 'white' },
      { role_number: 85, role_name: 'Business Analyst', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 86, role_name: 'Actuary', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 5, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 87, role_name: 'Tax Attorney', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 3, disc_c: 5, big5_o: 3, big5_c: 5, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 88, role_name: 'Compliance Officer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 5, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 89, role_name: 'Venture Capitalist', mbti_ei: 4, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 5, disc_i: 4, disc_s: 2, disc_c: 4, big5_o: 5, big5_c: 4, big5_e: 4, big5_a: 2, big5_n: 2, job_collar: 'white' },
      { role_number: 90, role_name: 'Private Equity Analyst', mbti_ei: 2, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'white' },
      // Education & Research (91-110)
      { role_number: 91, role_name: 'Professor', mbti_ei: 3, mbti_sn: 5, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 5, big5_c: 4, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 92, role_name: 'High School Teacher', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 5, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 5, big5_a: 5, big5_n: 2, job_collar: 'white' },
      { role_number: 93, role_name: 'Elementary School Teacher', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 4, disc_d: 3, disc_i: 5, disc_s: 5, disc_c: 2, big5_o: 4, big5_c: 4, big5_e: 5, big5_a: 5, big5_n: 2, job_collar: 'white' },
      { role_number: 94, role_name: 'Special Education Teacher', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 4, disc_d: 3, disc_i: 4, disc_s: 5, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 5, big5_n: 3, job_collar: 'white' },
      { role_number: 95, role_name: 'Education Administrator', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 4, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 96, role_name: 'Curriculum Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 5, big5_c: 4, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 97, role_name: 'Research Scientist', mbti_ei: 2, mbti_sn: 5, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 5, big5_c: 4, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 98, role_name: 'Lab Manager', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 4, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 4, big5_c: 5, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 99, role_name: 'Academic Advisor', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 4, disc_d: 3, disc_i: 4, disc_s: 5, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 4, big5_a: 5, big5_n: 2, job_collar: 'white' },
      { role_number: 100, role_name: 'Tutor', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 2, disc_i: 4, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 4, big5_a: 5, big5_n: 2, job_collar: 'white' },
      { role_number: 101, role_name: 'Corporate Trainer', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 5, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 5, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 102, role_name: 'Instructional Designer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 5, big5_c: 4, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 103, role_name: 'Librarian', mbti_ei: 2, mbti_sn: 4, mbti_tf: 2, mbti_jp: 4, disc_d: 2, disc_i: 2, disc_s: 5, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 2, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 104, role_name: 'Museum Curator', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 5, big5_c: 4, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 105, role_name: 'Archaeologist', mbti_ei: 2, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 2, disc_i: 2, disc_s: 4, disc_c: 4, big5_o: 5, big5_c: 3, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'white' },
      // Service & Hospitality (106-120)
      { role_number: 106, role_name: 'Hotel Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 4, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 5, big5_a: 4, big5_n: 2, job_collar: 'service' },
      { role_number: 107, role_name: 'Restaurant Manager', mbti_ei: 5, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 5, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 5, big5_a: 4, big5_n: 3, job_collar: 'service' },
      { role_number: 108, role_name: 'Event Planner', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 5, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 5, big5_a: 4, big5_n: 2, job_collar: 'service' },
      { role_number: 109, role_name: 'Flight Attendant', mbti_ei: 5, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 5, disc_s: 4, disc_c: 2, big5_o: 3, big5_c: 3, big5_e: 5, big5_a: 4, big5_n: 3, job_collar: 'service' },
      { role_number: 110, role_name: 'Tour Guide', mbti_ei: 5, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 5, disc_s: 4, disc_c: 2, big5_o: 4, big5_c: 3, big5_e: 5, big5_a: 4, big5_n: 2, job_collar: 'service' },
      { role_number: 111, role_name: 'Customer Success Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 5, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 5, big5_a: 5, big5_n: 2, job_collar: 'service' },
      { role_number: 112, role_name: 'Concierge', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 5, disc_s: 4, disc_c: 2, big5_o: 4, big5_c: 3, big5_e: 5, big5_a: 5, big5_n: 2, job_collar: 'service' },
      { role_number: 113, role_name: 'Travel Agent', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 4, disc_d: 3, disc_i: 4, disc_s: 5, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 4, big5_a: 4, big5_n: 2, job_collar: 'service' },
      { role_number: 114, role_name: 'Wedding Planner', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 4, disc_d: 4, disc_i: 5, disc_s: 4, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 4, big5_n: 2, job_collar: 'service' },
      { role_number: 115, role_name: 'Personal Concierge', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 5, disc_c: 3, big5_o: 3, big5_c: 3, big5_e: 4, big5_a: 5, big5_n: 2, job_collar: 'service' },
      // Trades & Technical (116-130)
      { role_number: 116, role_name: 'Electrician', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'blue' },
      { role_number: 117, role_name: 'Plumber', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'blue' },
      { role_number: 118, role_name: 'HVAC Technician', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'blue' },
      { role_number: 119, role_name: 'Welder', mbti_ei: 2, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'blue' },
      { role_number: 120, role_name: 'Carpenter', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 5, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'blue' },
      { role_number: 121, role_name: 'Mechanic', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'blue' },
      { role_number: 122, role_name: 'CNC Machine Operator', mbti_ei: 2, mbti_sn: 4, mbti_tf: 3, mbti_jp: 5, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'blue' },
      { role_number: 123, role_name: 'Construction Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 5, disc_i: 3, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 5, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'blue' },
      { role_number: 124, role_name: 'Civil Engineer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 2, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'blue' },
      { role_number: 125, role_name: 'Surveyor', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 2, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'blue' },
      // Legal & Government (126-140)
      { role_number: 126, role_name: 'Lawyer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 4, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 127, role_name: 'Judge', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 4, disc_i: 2, disc_s: 4, disc_c: 5, big5_o: 4, big5_c: 5, big5_e: 2, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 128, role_name: 'Paralegal', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 3, big5_c: 4, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 129, role_name: 'Police Officer', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 5, disc_i: 3, disc_s: 3, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 4, big5_a: 3, big5_n: 3, job_collar: 'blue' },
      { role_number: 130, role_name: 'Firefighter', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 5, disc_i: 3, disc_s: 4, disc_c: 3, big5_o: 3, big5_c: 4, big5_e: 4, big5_a: 4, big5_n: 3, job_collar: 'blue' },
      { role_number: 131, role_name: 'Social Worker', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 5, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 4, big5_a: 5, big5_n: 3, job_collar: 'service' },
      { role_number: 132, role_name: 'City Planner', mbti_ei: 3, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 133, role_name: 'Policy Analyst', mbti_ei: 3, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 3, disc_i: 3, disc_s: 4, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 3, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 134, role_name: 'Diplomat', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 4, disc_s: 3, disc_c: 4, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 135, role_name: 'Public Relations Specialist', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 5, disc_s: 3, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 5, big5_a: 4, big5_n: 2, job_collar: 'white' },
      // Media & Communication (136-150)
      { role_number: 136, role_name: 'Journalist', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 4, big5_a: 3, big5_n: 3, job_collar: 'white' },
      { role_number: 137, role_name: 'Content Writer', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 3, disc_s: 3, disc_c: 4, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 138, role_name: 'Technical Writer', mbti_ei: 2, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 2, disc_i: 2, disc_s: 4, disc_c: 5, big5_o: 4, big5_c: 4, big5_e: 2, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 139, role_name: 'Copywriter', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 140, role_name: 'Social Media Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 3, disc_i: 5, disc_s: 3, disc_c: 2, big5_o: 4, big5_c: 3, big5_e: 5, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 141, role_name: 'Public Relations Manager', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 5, disc_s: 3, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 5, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 142, role_name: 'Broadcast Journalist', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 5, disc_s: 3, disc_c: 3, big5_o: 4, big5_c: 3, big5_e: 5, big5_a: 3, big5_n: 3, job_collar: 'white' },
      { role_number: 143, role_name: 'News Producer', mbti_ei: 4, mbti_sn: 4, mbti_tf: 4, mbti_jp: 5, disc_d: 4, disc_i: 4, disc_s: 3, disc_c: 4, big5_o: 3, big5_c: 5, big5_e: 4, big5_a: 3, big5_n: 3, job_collar: 'white' },
      { role_number: 144, role_name: 'Film Director', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 5, disc_i: 4, disc_s: 2, disc_c: 3, big5_o: 5, big5_c: 4, big5_e: 4, big5_a: 2, big5_n: 2, job_collar: 'arts' },
      { role_number: 145, role_name: 'Screenwriter', mbti_ei: 3, mbti_sn: 4, mbti_tf: 2, mbti_jp: 3, disc_d: 2, disc_i: 4, disc_s: 3, disc_c: 3, big5_o: 5, big5_c: 3, big5_e: 3, big5_a: 3, big5_n: 3, job_collar: 'arts' },
      { role_number: 146, role_name: 'Film Editor', mbti_ei: 2, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 2, disc_i: 2, disc_s: 3, disc_c: 5, big5_o: 4, big5_c: 4, big5_e: 2, big5_a: 2, big5_n: 2, job_collar: 'arts' },
      { role_number: 147, role_name: 'Podcast Host', mbti_ei: 5, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 5, disc_s: 3, disc_c: 2, big5_o: 4, big5_c: 3, big5_e: 5, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 148, role_name: 'YouTube Creator', mbti_ei: 5, mbti_sn: 4, mbti_tf: 3, mbti_jp: 3, disc_d: 3, disc_i: 5, disc_s: 3, disc_c: 2, big5_o: 5, big5_c: 3, big5_e: 5, big5_a: 3, big5_n: 2, job_collar: 'white' },
      { role_number: 149, role_name: 'Communications Director', mbti_ei: 4, mbti_sn: 4, mbti_tf: 3, mbti_jp: 4, disc_d: 4, disc_i: 5, disc_s: 3, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 5, big5_a: 4, big5_n: 2, job_collar: 'white' },
      { role_number: 150, role_name: 'Lobbyist', mbti_ei: 4, mbti_sn: 4, mbti_tf: 4, mbti_jp: 4, disc_d: 5, disc_i: 4, disc_s: 2, disc_c: 3, big5_o: 4, big5_c: 4, big5_e: 4, big5_a: 3, big5_n: 2, job_collar: 'white' },
    ];

    // Insert job roles in batches
    const batchSize = 25;
    let totalInserted = 0;

    for (let i = 0; i < jobRolesData.length; i += batchSize) {
      const batch = jobRolesData.slice(i, i + batchSize);
      const { error } = await getSupabaseAdmin().from('job_roles').insert(batch);
      if (error) {
        console.error(`[POST /api/admin/seed-job-roles] Error inserting batch ${i / batchSize}:`, error);
      } else {
        totalInserted += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Job roles seeded successfully (${totalInserted} roles)`,
      rolesSeeded: totalInserted,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[POST /api/admin/seed-job-roles] Error:', error);
    return NextResponse.json(
      { error: 'Failed to seed job roles' },
      { status: 500, headers: corsHeaders }
    );
  }
}
