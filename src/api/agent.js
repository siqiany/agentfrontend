import axios from 'axios'

const API_BASE = 'http://localhost:8000' // 改成你的后端地址

export async function runCrew(userGoal, pdfFile,userID) {
  const formData = new FormData()
  formData.append('user_goal', userGoal)

  if(pdfFile){
    console.log('PDF uploaded',pdfFile)
    formData.append('pdf_file', pdfFile)
  }
  formData.append('user_id',userID)

  const response = await axios.post(`${API_BASE}/run_crew`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
