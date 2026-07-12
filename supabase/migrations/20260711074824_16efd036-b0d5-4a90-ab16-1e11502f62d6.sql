
CREATE POLICY "own assets read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own assets insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own assets update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own assets delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'assets' AND auth.uid()::text = (storage.foldername(name))[1]);
