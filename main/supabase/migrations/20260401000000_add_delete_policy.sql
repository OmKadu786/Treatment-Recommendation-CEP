CREATE POLICY "Users can delete own assessments" ON public.ipss_assessments FOR DELETE USING (auth.uid() = user_id);
