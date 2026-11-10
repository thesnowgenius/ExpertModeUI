import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('preview_builder',ROOT/'scripts/build_review_preview.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

class PreviewBuildTests(unittest.TestCase):
    def test_invalid_origins_never_create_an_artifact(self):
        for origin in ['', 'https://pass-picker-expert-mode-multi.onrender.com',
                       'https://pass-picker-expert-mode-multi.onrender.com.',
                       'https://api.snow-genius.com','http://sa.example.com',
                       'https://user:password@sa.example.com','https://sa.example.com/path',
                       'https://sa.example.com?token=secret','https://sa.example.com/',
                       'https://*.example.com','https://sa.example.invalid',
                       'http://127.0.0.1:8007','https://sa.example.com:443']:
            with self.subTest(origin=origin),tempfile.TemporaryDirectory() as root:
                output=Path(root)/'site'
                with self.assertRaises(ValueError):mod.build(origin,output)
                self.assertFalse(output.exists())

    def test_preview_contains_only_pinned_connect_destination(self):
        with tempfile.TemporaryDirectory() as root:
            output=Path(root)/'site';manifest=mod.build('https://sa-expert.example.com',output)
            index=(output/'index.html').read_text()
            self.assertIn('connect-src https://sa-expert.example.com;',index)
            self.assertNotIn('pass-picker-expert-mode-multi.onrender.com',index)
            self.assertNotIn('analytics.js',index)
            self.assertNotIn('resorts.json',index)
            self.assertIn('data-sg-deployment="review"',index)
            self.assertFalse((output/'.git').exists())
            self.assertFalse(list(output.rglob('*analytics*')))
            self.assertFalse(manifest['production_approved'])
            self.assertFalse(manifest['hosted_access_control_verified'])
            self.assertIn('assets/review-config.js',manifest['files'])
            self.assertIn('assets/script.js?v=',index)

    def test_source_files_unchanged_and_existing_output_preserved(self):
        before=(ROOT/'index.html').read_bytes()
        with tempfile.TemporaryDirectory() as root:
            output=Path(root)/'site';mod.build('https://sa.example.com',output)
            original=(output/'preview-manifest.json').read_bytes()
            with self.assertRaises(ValueError):mod.build('https://other.example.com',output)
            self.assertEqual((output/'preview-manifest.json').read_bytes(),original)
        self.assertEqual((ROOT/'index.html').read_bytes(),before)

    def test_local_test_is_explicit_and_marked(self):
        with tempfile.TemporaryDirectory() as root:
            manifest=mod.build('http://127.0.0.1:8007',Path(root)/'site',local_test=True)
            self.assertTrue(manifest['local_test_only'])
        with self.assertRaises(ValueError):mod.api_origin('https://sa.example.com',True)

    def test_output_cannot_be_nested_in_source(self):
        with self.assertRaises(ValueError):mod.build('https://sa.example.com',ROOT/'assets/preview-output')

    def test_unrecognized_html_layout_refuses_build(self):
        with tempfile.TemporaryDirectory() as root:
            source=Path(root)/'source';source.mkdir();(source/'assets').mkdir()
            (source/'index.html').write_text('<html><head></head></html>')
            with self.assertRaises(ValueError):mod.build('https://sa.example.com',Path(root)/'site',source=source)
            self.assertFalse((Path(root)/'site').exists())

    def test_pilot_build_locks_origin_notice_and_preserves_review_default(self):
        with tempfile.TemporaryDirectory() as root:
            output=Path(root)/'pilot'
            notice='Limited Gold and Nitro pilot.'
            manifest=mod.build('https://pilot.example.com',output,mode='pilot',pilot_notice=notice)
            index=(output/'index.html').read_text()
            config=(output/'assets/review-config.js').read_text()
            self.assertIn('data-sg-deployment="pilot"',index)
            self.assertIn('connect-src https://pilot.example.com;',index)
            self.assertIn('"mode": "pilot"',config)
            self.assertIn(notice,config)
            self.assertEqual(manifest['kind'],'isolated_expert_pilot')
            self.assertFalse(manifest['production_approved'])
            self.assertFalse(manifest['hosted_access_control_verified'])
            self.assertNotIn('analytics.js',index)
            self.assertNotIn('resorts.json',index)

    def test_invalid_modes_or_missing_pilot_notice_create_no_output(self):
        for mode,notice in [('other',None),('review','Pilot'),('pilot',None),
                            ('pilot',''),('pilot',' padded '),('pilot','x'*2001)]:
            with tempfile.TemporaryDirectory() as root:
                output=Path(root)/'site'
                with self.assertRaises(ValueError):
                    mod.build('https://pilot.example.com',output,mode=mode,pilot_notice=notice)
                self.assertFalse(output.exists())

if __name__=='__main__':unittest.main()
