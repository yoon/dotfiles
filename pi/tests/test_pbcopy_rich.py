import importlib.util
import pathlib
import unittest
from importlib.machinery import SourceFileLoader


SCRIPT = pathlib.Path(__file__).parents[1] / "bin" / "pbcopy-rich"
SPEC = importlib.util.spec_from_loader("pbcopy_rich", SourceFileLoader("pbcopy_rich", str(SCRIPT)))
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class MarkdownToRtfTest(unittest.TestCase):
    def test_link(self):
        rtf = MODULE.markdown_to_rtf("Read [the PR](https://example.com/1).")
        self.assertIn('HYPERLINK "https://example.com/1"', rtf)
        self.assertIn("the PR", rtf)
        self.assertNotIn("[the PR]", rtf)

    def test_bold_and_code(self):
        rtf = MODULE.markdown_to_rtf("**Ship** `Thing.call`")
        self.assertIn("{\\b Ship}", rtf)
        self.assertIn("{\\f1 Thing.call}", rtf)

    def test_unicode_and_rtf_metacharacters(self):
        rtf = MODULE.markdown_to_rtf("Café \\ {ready}")
        self.assertIn("Caf\\u233?", rtf)
        self.assertIn("\\\\ \\{ready\\}", rtf)


if __name__ == "__main__":
    unittest.main()
