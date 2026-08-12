import importlib.util
import pathlib
import unittest
from importlib.machinery import SourceFileLoader


SCRIPT = pathlib.Path(__file__).parents[1] / "bin" / "herdr-move-tab"
SPEC = importlib.util.spec_from_loader("herdr_move_tab", SourceFileLoader("herdr_move_tab", str(SCRIPT)))
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def pane(pane_id, x, y, width, height):
    return {"pane_id": pane_id, "rect": {"x": x, "y": y, "width": width, "height": height}}


class BuildTreeTest(unittest.TestCase):
    def test_single_pane(self):
        self.assertEqual(MODULE.build_tree([pane("a", 0, 0, 100, 100)]), MODULE.Leaf("a"))

    def test_reconstructs_nested_layout(self):
        tree = MODULE.build_tree([
            pane("a", 0, 0, 60, 40),
            pane("b", 60, 0, 40, 20),
            pane("c", 60, 20, 40, 20),
        ])

        self.assertEqual(tree.direction, "right")
        self.assertAlmostEqual(tree.ratio, 0.6)
        self.assertEqual(tree.first, MODULE.Leaf("a"))
        self.assertEqual(tree.second.direction, "down")
        self.assertAlmostEqual(tree.second.ratio, 0.5)

    def test_rejects_empty_layout(self):
        with self.assertRaisesRegex(RuntimeError, "no panes"):
            MODULE.build_tree([])

    def test_rejects_non_partitionable_layout(self):
        with self.assertRaisesRegex(RuntimeError, "could not reconstruct"):
            MODULE.build_tree([
                pane("a", 0, 0, 70, 70),
                pane("b", 30, 30, 70, 70),
            ])


class WorkspaceSelectionTest(unittest.TestCase):
    def test_finds_displayed_workspace_number(self):
        options = [{"number": 2, "label": "prod", "workspace_id": "w2"}]
        self.assertEqual(MODULE.workspace_for_number(options, 2), options[0])
        self.assertIsNone(MODULE.workspace_for_number(options, 1))


class FakeHerdr:
    def __init__(self, fail_on_move=None):
        self.calls = []
        self.move_count = 0
        self.fail_on_move = fail_on_move

    def __call__(self, *args):
        self.calls.append(args)
        if args[:2] == ("pane", "layout"):
            return {"layout": {
                "focused_pane_id": "c",
                "panes": [
                    pane("a", 0, 0, 60, 40),
                    pane("b", 60, 0, 40, 20),
                    pane("c", 60, 20, 40, 20),
                ],
            }}
        if args[:2] == ("tab", "get"):
            return {"tab": {"label": "prod-support"}}
        if args[:2] == ("pane", "move"):
            self.move_count += 1
            if self.move_count == self.fail_on_move:
                raise RuntimeError("injected failure")
            old_id = args[2]
            result = {"pane": {"pane_id": f"new-{old_id}"}}
            if "--new-tab" in args:
                result["created_tab"] = {"tab_id": "target-tab"}
            return {"move_result": result}
        raise AssertionError(f"unexpected call: {args}")


class MoveTabTest(unittest.TestCase):
    current = {"pane_id": "c", "tab_id": "source-tab", "workspace_id": "source"}
    target = {"workspace_id": "target"}

    def test_moves_all_panes_and_rebuilds_layout(self):
        api = FakeHerdr()

        MODULE.move_tab(self.target, current=self.current, api=api)

        moves = [call for call in api.calls if call[:2] == ("pane", "move")]
        self.assertEqual([call[2] for call in moves], ["a", "b", "c"])
        self.assertIn("--new-tab", moves[0])
        self.assertEqual(moves[1][moves[1].index("--split") + 1], "right")
        self.assertEqual(moves[2][moves[2].index("--split") + 1], "down")
        self.assertIn("--focus", moves[2])

    def test_refuses_current_workspace_before_moving(self):
        api = FakeHerdr()
        with self.assertRaisesRegex(RuntimeError, "already contains"):
            MODULE.move_tab({"workspace_id": "source"}, current=self.current, api=api)
        self.assertEqual(api.calls, [])

    def test_reports_partial_move(self):
        api = FakeHerdr(fail_on_move=2)
        with self.assertRaisesRegex(RuntimeError, "stopped after 1 of 3 panes.*target-tab"):
            MODULE.move_tab(self.target, current=self.current, api=api)


if __name__ == "__main__":
    unittest.main()
